import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { users, purchases } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { sendPurchaseConfirmation } from "@/lib/email";

const secretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!secretKey || !webhookSecret) {
    return NextResponse.json({ error: "Stripe env not configured" }, { status: 500 });
  }

  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature header" }, { status: 400 });
  }

  const stripe = new Stripe(secretKey);

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, webhookSecret);
  } catch (err: any) {
    console.error("Stripe webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Card payments arrive as checkout.session.completed with payment_status
  // "paid". Delayed methods (bank debits) complete as "unpaid" and are only
  // settled later via checkout.session.async_payment_succeeded.
  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;
    if (session.payment_status !== "paid") {
      return NextResponse.json({ received: true, pending: true });
    }
    const email = (session.customer_details?.email || session.customer_email || "").toLowerCase();
    const customerId =
      (typeof session.customer === "string" ? session.customer : session.customer?.id) ?? null;
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    const paymentId = paymentIntentId || session.id;

    if (!email) {
      console.warn("Stripe checkout completed with no customer email — cannot match to account:", session.id);
      return NextResponse.json({ received: true });
    }

    // Dedupe: if we've already recorded this payment, it's a webhook retry.
    const [existing] = await db
      .select()
      .from(purchases)
      .where(eq(purchases.paymentIntentId, paymentId))
      .limit(1);
    const isNew = !existing;

    // Match the account: the id we tagged the checkout with (signed-in buyers)
    // wins over the email typed into Stripe.
    let user: typeof users.$inferSelect | undefined;
    const ref = session.client_reference_id;
    if (ref && /^[0-9a-f-]{36}$/i.test(ref)) {
      [user] = await db.select().from(users).where(eq(users.id, ref));
    }
    if (!user) {
      [user] = await db.select().from(users).where(eq(users.email, email));
    }
    if (user) {
      await db.update(users)
        .set({ isPaid: true, stripeCustomerId: customerId, stripePaymentId: paymentId })
        .where(eq(users.id, user.id));
    }

    // Record the purchase so it can be applied the moment they sign up. When
    // the account already exists, mark it as claimed so the same payment can't
    // unlock a second account.
    await db.insert(purchases)
      .values({
        email,
        customerId,
        paymentIntentId: paymentId,
        amountTotal: session.amount_total ?? null,
        appliedToUserId: user?.id ?? null,
      })
      .onConflictDoNothing();

    if (isNew) {
      await sendPurchaseConfirmation({
        email,
        amountMinor: session.amount_total,
        currency: session.currency,
        paymentId,
      });
    }

    revalidatePath("/modules");
    revalidatePath("/welcome");
    return NextResponse.json({ received: true, applied: !!user });
  }

  // Refunds (the 14-day guarantee) and lost disputes revoke access.
  if (event.type === "charge.refunded" || event.type === "charge.dispute.closed") {
    const obj = event.data.object as Stripe.Charge | Stripe.Dispute;
    if (event.type === "charge.refunded" && !(obj as Stripe.Charge).refunded) {
      // Partial refund — keep access.
      return NextResponse.json({ received: true });
    }
    if (event.type === "charge.dispute.closed" && (obj as Stripe.Dispute).status !== "lost") {
      return NextResponse.json({ received: true });
    }
    const pi = typeof obj.payment_intent === "string" ? obj.payment_intent : obj.payment_intent?.id;
    if (pi) {
      await db.update(users).set({ isPaid: false }).where(eq(users.stripePaymentId, pi));
      // Drop the purchase record too, so an unclaimed refunded payment can't
      // be applied to an account later.
      await db.delete(purchases).where(eq(purchases.paymentIntentId, pi));
      console.log("Access revoked for refunded/disputed payment:", pi);
    }
    return NextResponse.json({ received: true, revoked: !!pi });
  }

  return NextResponse.json({ received: true });
}
