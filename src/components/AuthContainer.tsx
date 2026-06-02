"use client";

import { useState } from "react";
import { AuthView } from "@neondatabase/auth/react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { showError } from "@/utils/toast";

interface AuthContainerProps {
  path: string;
}

export default function AuthContainer({ path }: AuthContainerProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      // Trigger Google OAuth flow using Better Auth client
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/portal",
      });
    } catch (error: any) {
      console.error("Google Sign-In Error:", error);
      showError(error.message || "Failed to sign in with Google.");
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Custom Premium Google Sign-In Button */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full h-12 border-border/80 hover:bg-primary/5 hover:text-primary transition-all rounded-xl flex items-center justify-center gap-3 font-sans text-sm font-medium shadow-sm"
          onClick={handleGoogleSignIn}
          disabled={isGoogleLoading}
        >
          {isGoogleLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#EA4335"
                d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.227-3.103C18.22 1.814 15.47 1 12.24 1 6.033 1 1 6.033 1 12.24s5.033 11.24 11.24 11.24c6.478 0 10.793-4.537 10.793-10.986 0-.745-.08-1.31-.176-1.875H12.24z"
              />
            </svg>
          )}
          {isGoogleLoading ? "Connecting to Google..." : "Continue with Google"}
        </Button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-border/50"></div>
          <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase tracking-wider">
            or use email
          </span>
          <div className="flex-grow border-t border-border/50"></div>
        </div>
      </div>

      {/* Standard AuthView for Email/Password */}
      <div className="neon-auth-custom-view">
        <AuthView path={path} />
      </div>
    </div>
  );
}