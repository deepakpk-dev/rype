import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { CompareTray } from "@/components/layout/CompareTray";
import { SearchCommand } from "@/components/layout/SearchCommand";
import { Toaster } from "@/components/ui/Toaster";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rype — Fresh European Produce, Door to Door",
  description:
    "Farm-fresh fruits, vegetables, and herbs from small European growers, delivered in 24 hours.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body className="font-sans">
        <SessionProviderWrapper>
          <Header />
          <main className="min-h-[calc(100vh-240px)]">{children}</main>
          <Footer />
          <CartDrawer />
          <CompareTray />
          <SearchCommand />
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
