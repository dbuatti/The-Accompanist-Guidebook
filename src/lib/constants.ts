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

// Launch pricing window. The countdown states what the price becomes, so the
// urgency is real (Australian Consumer Law). On the day after it ends, change
// the Stripe Payment Link price to REGULAR_PRICE_AMOUNT — the site picks it up
// automatically within ~5 minutes and the countdown disappears.
export const PROMO_ENDS_AT = new Date("2026-11-16T23:59:59+11:00"); // Melbourne, AEDT
export const REGULAR_PRICE_AMOUNT = 197;

// Lessons anyone can watch without buying (public /preview pages).
export const FREE_PREVIEWS = [
  { moduleSlug: "how-to-cut-your-music", lessonSlug: "the-correct-bracket-notation" },
  { moduleSlug: "what-your-sheet-music-should-look-like", lessonSlug: "what-is-a-lead-sheet-and-why-it-s-not-acceptable" },
] as const;

export function isFreePreview(moduleSlug: string, lessonSlug: string): boolean {
  return FREE_PREVIEWS.some((p) => p.moduleSlug === moduleSlug && p.lessonSlug === lessonSlug);
}

export function previewHref(p: { moduleSlug: string; lessonSlug: string }): string {
  return `/preview/${p.moduleSlug}/${p.lessonSlug}`;
}
export const GUARANTEE_DAYS = 14;
