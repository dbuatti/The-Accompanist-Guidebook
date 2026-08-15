"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

// Promo pricing window. Adjust this date whenever launch pricing should end.
export const PROMO_ENDS_AT = new Date("2026-10-15T23:59:59+10:00");

export default function PromoCountdown() {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = PROMO_ENDS_AT.getTime() - now;
  if (diff <= 0) return null;

  const parts = [
    { v: Math.floor(diff / 86400000), l: "days" },
    { v: Math.floor((diff % 86400000) / 3600000), l: "hrs" },
    { v: Math.floor((diff % 3600000) / 60000), l: "min" },
    { v: Math.floor((diff % 60000) / 1000), l: "sec" },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright flex items-center gap-1.5">
        <Clock className="w-3 h-3" />
        Launch pricing ends in
      </span>
      <div className="flex items-center gap-2">
        {parts.map((p, i) => (
          <div key={p.l} className="flex items-center gap-2">
            {i > 0 && <span className="text-primary/30 font-bold">:</span>}
            <div className="flex flex-col items-center">
              <span className="w-14 py-2 rounded-lg bg-primary/[0.06] border border-primary/10 text-primary font-serif font-bold text-lg tabular-nums text-center">
                {String(p.v).padStart(2, "0")}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-muted-foreground/60 mt-1">{p.l}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
