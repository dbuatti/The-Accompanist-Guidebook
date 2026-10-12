import { logger } from "@/lib/logger";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { users, purchases } from "@/lib/schema";
import { eq, desc } from "drizzle-orm";
import { getErrorMessage } from "@/lib/errors";
import { requireUser } from "@/lib/auth";
import { parse, stripeSessionIdSchema } from "@/lib/validation";
import { isPurchaseClaimedByOther } from "./purchase-rules";

async function applyPurchaseToUser(
  userId: string,
  email: string,
  purchase: { customerId: string | null; paymentIntentId: string; amountTotal: number | null },
): Promise<boolean> {
  const existing = await db
    .select()
    .from(purchases)
    .where(eq(purchases.paymentIntentId, purchase.paymentIntentId))
    .limit(1);

  if (isPurchaseClaimedByOther(existing, userId)) {
    logger.warn("Purchase already claimed by another account:", purchase.paymentIntentId);
    return false;
  }

  await db.update(users)
    .set({ isPaid: true, stripeCustomerId: purchase.customerId, stripePaymentId: purchase.paymentIntentId })
    .where(eq(users.id, userId));

  if (existing.length > 0) {
    // The webhook already recorded this payment — claim it for this user, even
    // when the cardholder email differs from the sign-in email.
    await db.update(purchases).set({ appliedToUserId: userId }).where(eq(purchases.id, existing[0].id));
  } else {
    await db.insert(purchases)
      .values({ email, customerId: purchase.customerId, paymentIntentId: purchase.paymentIntentId, amountTotal: purchase.amountTotal, appliedToUserId: userId })
      .onConflictDoNothing();
  }
  return true;
}

// A Checkout Session keeps payment_status "paid" even after a refund, so check
// the underlying charge before granting access from Stripe directly.
async function isRefunded(stripe: Stripe, paymentIntentId: string | null | undefined): Promise<boolean> {
  if (!paymentIntentId || !paymentIntentId.startsWith("pi_")) return false;
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, { expand: ["latest_charge"] });
  const charge = pi.latest_charge;
  return typeof charge === "object" && !!charge && (charge.refunded || !!charge.disputed);
}

export async function verifyAndApplyPurchase(sessionId?: string | null) {
  try {
    const user = await requireUser();
    if (!user.email) return { isPaid: false };
    if (sessionId) sessionId = parse(stripeSessionIdSchema, sessionId);

    const [dbUser] = await db.select().from(users).where(eq(users.id, user.id));
    if (dbUser?.isPaid) return { isPaid: true };

    const email = user.email.toLowerCase();

    // Unlock by the exact Stripe Checkout session carried through sign-in, so a
    // purchase counts even when the cardholder's email differs from the login.
    if (sessionId && process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid" && session.status === "complete") {
        const piId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
        if (await isRefunded(stripe, piId)) return { isPaid: false };
        const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
        const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? sessionId;
        if (await applyPurchaseToUser(user.id, email, { customerId, paymentIntentId, amountTotal: session.amount_total ?? null })) {
          return { isPaid: true };
        }
      }
    }

    // Apply any webhook-confirmed purchase recorded for this email.
    const [pending] = await db.select()
      .from(purchases)
      .where(eq(purchases.email, email))
      .orderBy(desc(purchases.createdAt))
      .limit(1);
    if (pending && !pending.appliedToUserId) {
      if (await applyPurchaseToUser(user.id, email, { customerId: pending.customerId, paymentIntentId: pending.paymentIntentId, amountTotal: pending.amountTotal })) {
        return { isPaid: true };
      }
    }

    // Fallback: verify directly with Stripe by email (covers missed webhooks).
    if (process.env.STRIPE_SECRET_KEY) {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
      const sessions = await stripe.checkout.sessions.list({ customer_details: { email }, limit: 10 });
      const paid = sessions.data.find((s) => s.payment_status === "paid" && s.status === "complete");
      if (paid) {
        const piId = typeof paid.payment_intent === "string" ? paid.payment_intent : paid.payment_intent?.id;
        if (await isRefunded(stripe, piId)) return { isPaid: false };
        const customerId = typeof paid.customer === "string" ? paid.customer : paid.customer?.id ?? null;
        const paymentIntentId = typeof paid.payment_intent === "string" ? paid.payment_intent : paid.payment_intent?.id ?? paid.id;
        if (await applyPurchaseToUser(user.id, email, { customerId, paymentIntentId, amountTotal: paid.amount_total ?? null })) {
          return { isPaid: true };
        }
      }
    }

    return { isPaid: false };
  } catch (error) {
    logger.error("Error verifying purchase:", getErrorMessage(error));
    return { isPaid: false };
  }
}
