import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/layout/CartDrawer";
import { CompareTray } from "@/components/layout/CompareTray";
import { SearchCommand } from "@/components/layout/SearchCommand";
import { Toaster } from "@/components/ui/Toaster";
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper";
import { CatalogProvider } from "@/lib/catalog-context";
import { listProducts } from "@/lib/products/queries";
import { GrowthProvider } from "@/lib/growth/GrowthProvider";

export const metadata: Metadata = {
  title: "Rype — Fresh European Produce, Door to Door",
  description:
    "Farm-fresh fruits, vegetables, and herbs from small European growers, delivered in 24 hours.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const products = await listProducts();
  return (
    <html lang="en">
      <body className="font-sans">
        <SessionProviderWrapper>
          <GrowthProvider>
            <CatalogProvider products={products}>
              <Header />
              <main className="min-h-[calc(100vh-240px)]">{children}</main>
              <Footer />
              <CartDrawer />
              <CompareTray />
              <SearchCommand />
              <Toaster />
            </CatalogProvider>
          </GrowthProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
