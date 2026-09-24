"use client";

import { useState } from "react";
import { Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { joinWaitlist } from "@/app/actions/waitlist";

export default function WaitlistForm({ source = "landing" }: { source?: string }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const res = await joinWaitlist({ email, source });
    setLoading(false);
    if (res.ok) {
      setDone(true);
      toast.success("You're on the list");
    } else {
      toast.error(res.reason);
    }
  };

  if (done) {
    return (
      <div className="flex items-center justify-center gap-2 text-sm text-primary font-medium">
        <CheckCircle2 className="w-4 h-4 text-accent-bright" />
        You&apos;re on the list. Watch your inbox.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col sm:flex-row items-stretch gap-3 justify-center" aria-label="Join the email list">
      <div className="relative">
        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          inputMode="email"
          autoComplete="email"
          className="w-full sm:w-72 rounded-xl border border-border bg-card/70 pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/30"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-md shadow-primary/15 hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {loading ? "Joining…" : "Get the tips"}
        {!loading && <ArrowRight className="w-4 h-4" />}
      </button>
    </form>
  );
}