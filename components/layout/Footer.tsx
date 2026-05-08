"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/ui/Logo";
import { Instagram, Leaf, Truck, Sparkles } from "lucide-react";

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;
  return (
    <footer className="border-t border-rype-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-rype-mute">
            Small-farm European produce, picked in the morning and at your door the next day.
          </p>
          <div className="mt-4 flex gap-2">
            <a className="btn-ghost" href="#" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>
        {[
          { title: "Shop", links: [
            { href: "/products", label: "All produce" },
            { href: "/products?category=fruits", label: "Fruits" },
            { href: "/products?category=vegetables", label: "Vegetables" },
            { href: "/products?category=bundles", label: "Bundles" },
          ]},
          { title: "Care", links: [
            { href: "#", label: "Delivery" },
            { href: "#", label: "Freshness guarantee" },
            { href: "#", label: "Contact" },
            { href: "#", label: "FAQ" },
          ]},
          { title: "Promise", links: [
            { href: "#", label: "Our growers" },
            { href: "#", label: "Sustainability" },
            { href: "#", label: "Packaging" },
            { href: "#", label: "Careers" },
          ]},
        ].map((col) => (
          <div key={col.title}>
            <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-rype-mute">
              {col.title}
            </div>
            <ul className="space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-rype-ink/80 hover:text-rype-leafDark">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-rype-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-4 text-xs text-rype-mute sm:flex-row">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" /> 24h delivery</span>
            <span className="flex items-center gap-1.5"><Leaf className="h-3.5 w-3.5" /> Small-farm sourced</span>
            <span className="hidden items-center gap-1.5 sm:flex"><Sparkles className="h-3.5 w-3.5" /> 100% freshness guarantee</span>
          </div>
          <span>© {new Date().getFullYear()} Rype. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
