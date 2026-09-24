import Link from "next/link";
import { Music, ArrowRight } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center justify-center px-6">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-primary/[0.04] blur-3xl pointer-events-none" />

      <div className="relative text-center space-y-6 max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto ring-1 ring-primary/10">
          <Music className="w-6 h-6 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-accent-bright">404 · off-script</p>
          <h1 className="text-4xl font-serif font-bold text-primary">Wrong room</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            That page has already done its final bow. The course is still here, though.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15 hover:-translate-y-0.5"
        >
          {SITE_NAME}
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}