"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { primaryHref, primaryLabel, COURSE_PRICE_DISPLAY, GUARANTEE_DAYS } from "@/lib/constants";

export default function MobileStickyCTA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const past = window.scrollY > 560;
      const nearBottom = window.innerHeight + window.scrollY > document.body.scrollHeight - 900;
      setVisible(past && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 sm:hidden border-t border-border/60 bg-background/95 backdrop-blur-md px-4 py-3 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
      <div className="flex items-center gap-3">
        <div className="min-w-0">
          <p className="text-lg font-serif font-bold text-primary tabular-nums leading-none">{COURSE_PRICE_DISPLAY}</p>
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 leading-none">
            <ShieldCheck className="w-3 h-3 text-accent-bright" />
            {GUARANTEE_DAYS}-day guarantee
          </p>
        </div>
        <a
          href={primaryHref}
          target={primaryHref.startsWith("http") ? "_blank" : undefined}
          rel={primaryHref.startsWith("http") ? "noopener noreferrer" : undefined}
          className="flex-1 inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium text-sm active:bg-primary/90"
        >
          {primaryLabel}
          <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}