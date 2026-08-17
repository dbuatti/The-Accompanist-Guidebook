"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface CTAButtonProps {
  href: string;
  children: React.ReactNode;
  target?: string;
  rel?: string;
  className?: string;
}

export function CTAButton({ href, children, target, rel, className = "" }: CTAButtonProps) {
  return (
    <Link
      href={href}
      target={target}
      rel={rel}
      className={`inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-medium text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:shadow-xl hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${className}`}
    >
      {children}
      <ArrowRight className="w-4 h-4" />
    </Link>
  );
}

interface SecondaryButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export function SecondaryButton({ href, children, className = "" }: SecondaryButtonProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 border border-border bg-card/60 hover:border-primary/25 text-foreground/80 px-8 py-3.5 rounded-xl font-medium text-sm transition-all focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none ${className}`}
    >
      {children}
    </Link>
  );
}
