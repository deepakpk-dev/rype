"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus, Scale, Leaf } from "lucide-react";
import { formatEUR, cn } from "@/lib/utils";
import { useCart, useWishlist, useCompare } from "@/lib/stores";
import { toast } from "@/components/ui/Toaster";

// Structural shape — accepts both the Prisma `Product` row and the static
// `data/products.ts` Product type. Keeps this card decoupled from either.
export type CardProduct = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  unit: string;
  price: number;
  origin: string;
  organic: boolean;
  inSeason: boolean;
  images: string[];
};

export function ProductCard({ p, index = 0 }: { p: CardProduct; index?: number }) {
  const add = useCart((s) => s.add);
  const wl = useWishlist();
  const cmp = useCompare();
  const inWl = wl.ids.includes(p.id);
  const inCmp = cmp.ids.includes(p.id);

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index, 10) * 0.03 }}
      className="group card relative flex flex-col overflow-hidden hover:-translate-y-1 hover:shadow-lift"
    >
      <Link href={`/products/${p.slug}`} className="relative block aspect-square overflow-hidden bg-rype-cream">
        <Image
          src={p.images[0]}
          alt={p.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
        />
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-col gap-1">
            {p.organic && (
              <span className="inline-flex items-center gap-1 rounded-full bg-rype-leaf/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                <Leaf className="h-2.5 w-2.5" /> Organic
              </span>
            )}
            {p.inSeason && (
              <span className="inline-flex w-fit items-center rounded-full bg-rype-yellow/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rype-ink">
                In season
              </span>
            )}
          </div>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end gap-1.5 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <button
            aria-label="Compare"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!inCmp && cmp.ids.length >= 4) return toast("Compare up to 4", "info");
              cmp.toggle(p.id);
              toast(inCmp ? "Removed from compare" : "Added to compare");
            }}
            className={cn(
              "pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-soft backdrop-blur transition hover:scale-110",
              inCmp && "bg-rype-leaf text-white"
            )}
          >
            <Scale className="h-4 w-4" />
          </button>
          <button
            aria-label="Wishlist"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              wl.toggle(p.id);
              toast(inWl ? "Removed from wishlist" : "Saved to wishlist");
            }}
            className={cn(
              "pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-soft backdrop-blur transition hover:scale-110",
              inWl && "bg-rype-red text-white"
            )}
          >
            <Heart className={cn("h-4 w-4", inWl && "fill-current")} />
          </button>
        </div>
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base font-semibold leading-tight text-rype-ink">
            <Link href={`/products/${p.slug}`} className="hover:text-rype-leafDark">
              {p.name}
            </Link>
          </h3>
          <div className="shrink-0 text-right">
            <div className="font-semibold tabular-nums">{formatEUR(p.price)}</div>
            <div className="text-[11px] text-rype-mute">{p.unit}</div>
          </div>
        </div>
        <p className="text-xs text-rype-mute">{p.origin} · {p.tagline}</p>
        <button
          onClick={() => {
            add(p.id);
            toast(`Added ${p.name}`);
          }}
          className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full bg-rype-ink px-4 py-2 text-sm font-medium text-white transition hover:bg-rype-leafDark active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add to basket
        </button>
      </div>
    </motion.article>
  );
}
