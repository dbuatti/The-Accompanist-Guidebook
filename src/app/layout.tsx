import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/globals.css";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Providers from "./providers";
import { NeonAuthUIProvider } from "@neondatabase/auth/react";
import { authClient } from "@/lib/auth/client";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://theauditionguidebook.vercel.app"),
  title: {
    default: "The Audition Guidebook",
    template: "%s | The Audition Guidebook",
  },
  description: "A video course for musical theatre performers. Choose and prepare your songs, set your tempo, and collaborate with the audition pianist and panel with confidence. Taught from the accompanist's bench.",
  keywords: ["musical theatre", "audition", "vocal", "singer", "accompanist", "pianist", "music director", "online course"],
  openGraph: {
    type: "website",
    locale: "en_AU",
    url: "https://theauditionguidebook.vercel.app",
    siteName: "The Audition Guidebook",
    title: "The Audition Guidebook",
    description: "A video course for musical theatre performers. Prepare your music, set your tempo, and walk into your audition feeling calm and in control.",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Audition Guidebook",
    description: "A video course for musical theatre performers. Prepare your music, set your tempo, and walk into your audition feeling calm and in control.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {/* Cast authClient to any to bypass internal SDK type mismatches */}
        <NeonAuthUIProvider authClient={authClient as any} defaultTheme="light" redirectTo="/welcome?" baseURL={process.env.NEXT_PUBLIC_APP_URL || ""}>
          <Providers>
            <TooltipProvider>
              {children}
              <Sonner position="top-center" />
            </TooltipProvider>
          </Providers>
        </NeonAuthUIProvider>
      </body>
    </html>
  );
}