"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function CopyEmailsButton({ emails }: { emails: string[] }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(emails.join("\n"));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border border-border bg-card/60 hover:border-primary/25 text-foreground/80 transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
    >
      {copied ? <Check className="w-4 h-4 text-accent-bright" /> : <Copy className="w-4 h-4" />}
      {copied ? "Copied!" : "Copy emails"}
    </button>
  );
}