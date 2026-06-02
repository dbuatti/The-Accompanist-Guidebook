"use client";

import { useState } from "react";
import { AuthView } from "@neondatabase/auth/react";
import { authClient } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldAlert } from "lucide-react";
import { showError, showSuccess } from "@/utils/toast";
import { useRouter } from "next/navigation";

interface AuthContainerProps {
  path: string;
}

export default function AuthContainer({ path }: AuthContainerProps) {
  const router = useRouter();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
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

  const handleAdminAutoLogin = async () => {
    setIsAdminLoading(true);
    const adminEmail = "admin@accompanist.com";
    const adminPassword = "AdminPassword2026!";
    const adminName = "Administrator";

    try {
      // 1. Try to sign up first in case the admin account doesn't exist yet
      try {
        await authClient.signUp.email({
          email: adminEmail,
          password: adminPassword,
          name: adminName,
        });
        showSuccess("Admin account created and logged in!");
        router.push("/portal");
        return;
      } catch (signUpError: any) {
        // If user already exists, we proceed to sign in
        console.log("Sign up skipped (user likely exists):", signUpError.message);
      }

      // 2. Sign in with the admin credentials
      await authClient.signIn.email({
        email: adminEmail,
        password: adminPassword,
      });

      showSuccess("Logged in as Admin!");
      router.push("/portal");
    } catch (error: any) {
      console.error("Admin Auto-Login Error:", error);
      showError(error.message || "Failed to auto-login as Admin.");
    } finally {
      setIsAdminLoading(false);
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
          disabled={isGoogleLoading || isAdminLoading}
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

        {/* Admin Auto-Login Button */}
        <Button
          type="button"
          variant="secondary"
          className="w-full h-12 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/20 transition-all rounded-xl flex items-center justify-center gap-3 font-sans text-sm font-semibold shadow-sm"
          onClick={handleAdminAutoLogin}
          disabled={isGoogleLoading || isAdminLoading}
        >
          {isAdminLoading ? (
            <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          )}
          {isAdminLoading ? "Logging in as Admin..." : "Auto-Login as Admin"}
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