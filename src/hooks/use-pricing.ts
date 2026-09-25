"use client";

import { useEffect, useState } from "react";
import { getCoursePriceAction } from "@/app/actions/pricing";
import { COURSE_PRICE_DISPLAY } from "@/lib/constants";

// Shows the live Stripe price once it loads; falls back to the configured
// constant so the UI never renders a blank/incorrect price.
export function usePricing() {
  const [display, setDisplay] = useState(COURSE_PRICE_DISPLAY);

  useEffect(() => {
    let mounted = true;
    getCoursePriceAction()
      .then((price) => {
        if (mounted && price?.display) setDisplay(price.display);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  return { display };
}