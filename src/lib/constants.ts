export const SITE_NAME = "The Audition Guidebook";

export const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

export const primaryHref = paymentLink || "/modules";
export const primaryLabel = "Get Full Access";

// --- Sales offer ---
// Verify these match your Stripe pricing before they ship.
export const COURSE_PRICE_AMOUNT = 147; // recommended launch price (see admin/strategy C2)
export const COURSE_PRICE_CURRENCY = "AUD";
export const COURSE_PRICE_DISPLAY = `$${COURSE_PRICE_AMOUNT} ${COURSE_PRICE_CURRENCY}`;
export const GUARANTEE_DAYS = 14;
