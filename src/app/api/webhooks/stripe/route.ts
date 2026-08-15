import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/db";
import { users, purchases } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

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

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const email = (session.customer_details?.email || session.customer_email || "").toLowerCase();
    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id;
    const paymentIntentId =
      typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id;
    const paymentId = paymentIntentId || session.id;

    if (!email) {
      console.warn("Stripe checkout completed with no customer email — cannot match to account:", session.id);
      return NextResponse.json({ received: true });
    }

    // If the account already exists, grant access immediately.
    const [user] = await db.select().from(users).where(eq(users.email, email));
    if (user) {
      await db.update(users)
        .set({ isPaid: true, stripeCustomerId: customerId, stripePaymentId: paymentId })
        .where(eq(users.id, user.id));
      await db.insert(purchases)
        .values({ email, customerId, paymentIntentId: paymentId, amountTotal: session.amount_total ?? null })
        .onConflictDoNothing();
      revalidatePath("/modules");
      revalidatePath("/welcome");
      return NextResponse.json({ received: true, applied: true });
    }

    // Otherwise record the purchase so it can be applied the moment they sign up.
    await db.insert(purchases)
      .values({ email, customerId, paymentIntentId: paymentId, amountTotal: session.amount_total ?? null })
      .onConflictDoNothing();
  }

  return NextResponse.json({ received: true });
}
