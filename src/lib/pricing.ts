import { cache } from "react";
import { COURSE_PRICE_AMOUNT, COURSE_PRICE_CURRENCY } from "@/lib/constants";

// The single source of truth for the course price is the Stripe Payment Link.
// Everything on the site that advertises a price reads from here, so changing
// the price once in the Stripe dashboard updates every surface automatically
// (within the cache window) — no code edits, no redeploys, no drift.
//
// When STRIPE_SECRET_KEY or the payment link isn't configured (e.g. local
// dev), it falls back to the constants in src/lib/constants.ts.

export interface CoursePrice {
  amount: number;
  currency: string;
  display: string;
}

const REVALIDATE_SECONDS = 300;

function fallbackPrice(): CoursePrice {
  return {
    amount: COURSE_PRICE_AMOUNT,
    currency: COURSE_PRICE_CURRENCY,
    display: `$${COURSE_PRICE_AMOUNT} ${COURSE_PRICE_CURRENCY}`,
  };
}

function formatDisplay(amount: number, currency: string): string {
  const c = currency.toUpperCase();
  return `$${amount.toLocaleString("en-AU")} ${c}`;
}

async function stripeFetch(path: string): Promise<any | null> {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  try {
    const res = await fetch(`https://api.stripe.com${path}`, {
      headers: { Authorization: `Bearer ${key}` },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Stripe price fetch failed:", error);
    return null;
  }
}

export const getCoursePrice = cache(async (): Promise<CoursePrice> => {
  const base = fallbackPrice();
  const linkUrl = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK;
  if (!linkUrl || !process.env.STRIPE_SECRET_KEY) return base;

  // Public buy.stripe.com URLs don't embed the pl_ id, so list active payment
  // links and match on the URL we advertise.
  const list = await stripeFetch("/v1/payment_links?active=true&limit=100");
  const match = (list?.data ?? []).find((pl: any) => pl.url === linkUrl);
  if (!match?.id) return base;

  const pl = await stripeFetch(`/v1/payment_links/${match.id}?expand[]=line_items.data.price`);
  const items = (pl?.line_items?.data ?? []) as { price: any; quantity?: number }[];
  let totalMinor = 0;
  let currency = pl?.currency || base.currency;
  for (const item of items) {
    const price = item.price;
    if (price && typeof price.unit_amount === "number") {
      totalMinor += price.unit_amount * (item.quantity ?? 1);
      if (price.currency) currency = price.currency;
    }
  }
  if (totalMinor <= 0) return base;

  const amount = Math.round(totalMinor / 100);
  return { amount, currency: currency.toUpperCase(), display: formatDisplay(amount, currency) };
});