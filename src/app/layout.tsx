import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "@/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "The Accompanist Guidebook",
  description: "A musical theatre learning portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <Providers>
          <TooltipProvider>
            {children}
            <Toaster />
            <Sonner position="top-center" />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}