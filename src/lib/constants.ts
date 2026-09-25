export const SITE_NAME = "The Audition Guidebook";

// Where buyers email for refunds, access problems and questions. Must be an
// inbox you actually read — the 14-day guarantee depends on it.
export const SUPPORT_EMAIL = "info@danielebuatti.com";
export const OWNER_NAME = "Daniele Buatti";
export const COPYRIGHT_LINE = `© ${new Date().getFullYear()} ${OWNER_NAME} · Melbourne, Australia`;

export const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

export const primaryHref = paymentLink || "/modules";

// For a signed-in learner, pre-fill their email at checkout and tag the
// payment with their account id, so the purchase unlocks the right account
// even if they type a different email into Stripe.
export function checkoutUrlFor(user?: { id?: string | null; email?: string | null } | null): string {
  if (!paymentLink) return "/auth/sign-in";
  if (!user?.id) return paymentLink;
  const url = new URL(paymentLink);
  url.searchParams.set("client_reference_id", user.id);
  if (user.email) url.searchParams.set("prefilled_email", user.email);
  return url.toString();
}
export const primaryLabel = "Get Full Access";

// --- Sales offer ---
// Verify these match your Stripe pricing before they ship.
export const COURSE_PRICE_AMOUNT = 147; // recommended launch price (see admin/strategy C2)
export const COURSE_PRICE_CURRENCY = "AUD";
export const COURSE_PRICE_DISPLAY = `$${COURSE_PRICE_AMOUNT} ${COURSE_PRICE_CURRENCY}`;
export const GUARANTEE_DAYS = 14;
