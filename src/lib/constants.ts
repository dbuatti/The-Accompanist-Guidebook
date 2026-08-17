export const SITE_NAME = "The Audition Guidebook";

export const paymentLink = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;

export const primaryHref = paymentLink || "/modules";
export const primaryLabel = "Get Full Access";
