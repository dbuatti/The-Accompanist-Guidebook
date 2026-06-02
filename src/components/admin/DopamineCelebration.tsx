"use client";

import React from "react";
import { Award, Flame } from "lucide-react";

interface DopamineCelebrationProps {
  show: boolean;
  message: string;
}

export default function DopamineCelebration({ show, message }: DopamineCelebrationProps) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center bg-black/10 backdrop-blur-[1px] animate-in fade-in duration-300">
      <div className="bg-primary text-primary-foreground px-8 py-6 rounded-2xl shadow-2xl border border-accent/30 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-300 max-w-md text-center">
        <div className="w-16 h-16 rounded-full bg-accent/20 text-accent flex items-center justify-center animate-bounce">
          <Award className="w-10 h-10 fill-accent" />
        </div>
        <h3 className="text-2xl font-serif font-bold text-accent">Level Up!</h3>
        <p className="text-sm font-medium leading-relaxed">{message}</p>
        <div className="flex gap-1 mt-2">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-accent">Keep the momentum going!</span>
        </div>
      </div>
    </div>
  );
}