"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, Facebook, Instagram, Leaf, MapPin, Sparkles } from "lucide-react";

import { Logo } from "@/components/ui/Logo";

const columns = [
  { title: "Shop", links: [["All produce", "/products"], ["Fruits", "/products?category=fruits"], ["Vegetables", "/products?category=vegetables"], ["Herbs", "/products?category=herbs"], ["Bundles", "/products?category=bundles"], ["Gift cards", "#"]] },
  { title: "Care", links: [["Shipping", "#"], ["Returns", "#"], ["FAQs", "#"], ["Contact us", "#"], ["Track your order", "#"]] },
  { title: "Our promise", links: [["Our growers", "#"], ["Sustainability", "#"], ["Freshness guarantee", "#"], ["Our story", "#"], ["Journal", "#"]] },
] as const;

export function Footer() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="border-t border-rype-line bg-[#fbfaf3]">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-2 sm:py-14 lg:grid-cols-[1.25fr_repeat(3,1fr)_1.1fr] lg:gap-8">
        <div>
          <Logo />
          <p className="mt-4 max-w-[13rem] text-xs leading-5 text-rype-mute">Good food. Brighter days. European produce, from people who care to people who care.</p>
          <div className="mt-5 flex gap-2 text-rype-ink/70"><a href="#" aria-label="Instagram" className="rounded-full border border-rype-line p-2 hover:bg-white"><Instagram className="h-4 w-4" /></a><a href="#" aria-label="Facebook" className="rounded-full border border-rype-line p-2 hover:bg-white"><Facebook className="h-4 w-4" /></a></div>
        </div>
        {columns.map((column) => (
          <div key={column.title}>
            <div className="mb-4 text-xs font-semibold text-rype-ink">{column.title}</div>
            <ul className="space-y-2 text-xs text-rype-mute">{column.links.map(([label, href]) => <li key={label}><Link href={href} className="hover:text-rype-leafDark">{label}</Link></li>)}</ul>
          </div>
        ))}
        <div>
          <div className="mb-4 text-xs font-semibold text-rype-ink">Contact</div>
          <div className="space-y-2 text-xs leading-5 text-rype-mute"><p>hello@rype.com</p><p>+44 20 1234 5678</p><p>Mon – Fri, 8am – 6pm (CET)</p><p className="flex items-center gap-1.5 pt-2"><MapPin className="h-3.5 w-3.5 text-rype-leafDark" /> London, UK</p></div>
        </div>
      </div>
      <div className="border-t border-rype-line"><div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-4 text-[10px] text-rype-mute sm:flex-row"><span>© {new Date().getFullYear()} Rype. All rights reserved.</span><span className="flex items-center gap-3"><span className="flex items-center gap-1"><Clock3 className="h-3 w-3" /> 24h delivery in selected areas</span><span className="flex items-center gap-1"><Leaf className="h-3 w-3" /> 100% freshness guarantee</span><Sparkles className="h-3.5 w-3.5 text-rype-leafDark" /></span></div></div>
    </footer>
  );
}
