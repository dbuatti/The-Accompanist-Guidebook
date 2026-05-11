"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Lock } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";
import { validateAccess } from "@/app/actions";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await validateAccess(password);
      if (result.success) {
        localStorage.setItem("auth_session", result.userId!);
        localStorage.setItem("auth_role", result.role!);
        showSuccess("Welcome to the Guidebook");
        
        if (result.role === 'admin') {
          router.push("/admin");
        } else {
          router.push("/portal");
        }
      } else {
        showError("Incorrect password. Please try again.");
      }
    } catch (error) {
      showError("Connection error. Please check your database setup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      
      <div className="z-10 w-full max-w-md p-8 text-center space-y-8">
        <div className="space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <Music size={32} />
          </div>
          <h1 className="text-4xl font-serif font-bold text-primary">The Accompanist Guidebook</h1>
          <p className="text-muted-foreground italic">
            "Maybe This Time" — A musical theatre learning portal
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 bg-card p-8 rounded-2xl shadow-xl border border-border/50">
          <div className="space-y-2 text-left">
            <label className="text-sm font-medium text-muted-foreground ml-1">Enter Access Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                className="pl-10 bg-background border-border/50 focus:ring-primary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-lg font-serif"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Enter Portal"}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground uppercase tracking-widest">
          Private Educational Resource
        </p>
      </div>
    </div>
  );
}