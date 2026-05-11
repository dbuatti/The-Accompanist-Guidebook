import Link from "next/link";
import { Music } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      
      <div className="z-10 text-center space-y-8 p-4">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 text-primary mb-4">
            <Music size={40} />
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary tracking-tight">
            The Accompanist Guidebook
          </h1>
          <p className="text-xl text-muted-foreground italic max-w-2xl mx-auto">
            "Maybe This Time" — A comprehensive portal for musical theatre collaboration.
          </p>
        </div>

        <div className="pt-4">
          <Link 
            href="/auth/sign-in" 
            className="inline-flex items-center justify-center bg-primary text-primary-foreground px-10 py-4 rounded-full font-serif text-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Enter the Portal
          </Link>
        </div>

        <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] pt-12">
          Private Educational Resource &copy; 2026
        </p>
      </div>
    </div>
  );
}