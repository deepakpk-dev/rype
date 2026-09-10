"use client";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Plus, Scale, Leaf } from "lucide-react";
import { formatEUR, cn } from "@/lib/utils";
import { useCart, useWishlist, useCompare } from "@/lib/stores";
import { toast } from "@/components/ui/Toaster";
import { useCatalog } from "@/lib/catalog-context";
import { useGrowth } from "@/lib/growth/GrowthProvider";
import { addToCartEvent } from "@/lib/growth/instrumentation";
import type { AddToCartPlacement } from "@/lib/growth/instrumentation";

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
  stock: number;
  images: string[];
};

export function ProductCard({
  p,
  index = 0,
  placement = "listing",
  variant = "default",
  displayName,
  displayTagline,
  displayPrice,
  badge,
}: {
  p: CardProduct;
  index?: number;
  placement?: AddToCartPlacement;
  variant?: "default" | "homepage";
  displayName?: string;
  displayTagline?: string;
  displayPrice?: number;
  badge?: string;
}) {
  const add = useCart((s) => s.add);
  const products = useCatalog();
  const { track } = useGrowth();
  const wl = useWishlist();
  const cmp = useCompare();
  const inWl = wl.ids.includes(p.id);
  const inCmp = cmp.ids.includes(p.id);
  const soldOut = p.stock <= 0;
  const usesCatalogArt = p.images[0]?.startsWith("/product-images/rype-catalog");
  const home = variant === "homepage";
  const shownName = displayName ?? p.name;
  const shownTagline = displayTagline ?? p.tagline;
  const shownPrice = displayPrice ?? p.price;

  return (
    <motion.article
      layout
      initial={home ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: home ? 0 : Math.min(index, 10) * 0.03 }}
      className={cn(
        "group relative flex flex-col overflow-hidden",
        home
          ? "rounded-2xl border border-rype-line bg-white shadow-soft"
          : "card hover:-translate-y-1 hover:shadow-lift"
      )}
    >
      <Link href={`/products/${p.slug}`} className="relative block aspect-square overflow-hidden bg-[#fffaf2]">
        <Image
          src={p.images[0]}
          alt={p.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className={cn(
            "transition-transform duration-500 group-hover:scale-[1.06]",
            usesCatalogArt ? "object-contain p-5 sm:p-6" : "object-cover"
          )}
        />
      </Link>
      {home ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end p-3">
          {badge && <span className="mr-auto rounded-full bg-rype-leaf px-2.5 py-1 text-[10px] font-semibold text-white">{badge}</span>}
          <button
            aria-label={`Wishlist ${shownName}`}
            onClick={() => {
              wl.toggle(p.id);
              toast(inWl ? "Removed from wishlist" : "Saved to wishlist");
            }}
            className={cn("pointer-events-auto grid h-8 w-8 place-items-center rounded-full bg-white/95 shadow-soft transition hover:scale-110", inWl && "bg-rype-red text-white")}
          >
            <Heart className={cn("h-4 w-4", inWl && "fill-current")} />
          </button>
        </div>
      ) : (
        <>
          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <div className="flex flex-col gap-1">
              {p.organic && <span className="inline-flex items-center gap-1 rounded-full bg-rype-leaf/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"><Leaf className="h-2.5 w-2.5" /> Organic</span>}
              {p.inSeason && <span className="inline-flex w-fit items-center rounded-full bg-rype-yellow/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-rype-ink">In season</span>}
              {soldOut && <span className="inline-flex w-fit items-center rounded-full bg-rype-ink/85 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">Sold out</span>}
            </div>
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-end gap-1.5 p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <button aria-label="Compare" onClick={() => { if (!inCmp && cmp.ids.length >= 4) return toast("Compare up to 4", "info"); cmp.toggle(p.id); toast(inCmp ? "Removed from compare" : "Added to compare"); }} className={cn("pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-soft backdrop-blur transition hover:scale-110", inCmp && "bg-rype-leaf text-white")}><Scale className="h-4 w-4" /></button>
            <button aria-label="Wishlist" onClick={() => { wl.toggle(p.id); toast(inWl ? "Removed from wishlist" : "Saved to wishlist"); }} className={cn("pointer-events-auto grid h-9 w-9 place-items-center rounded-full bg-white/95 shadow-soft backdrop-blur transition hover:scale-110", inWl && "bg-rype-red text-white")}><Heart className={cn("h-4 w-4", inWl && "fill-current")} /></button>
          </div>
        </>
      )}
      <div className={cn("flex flex-1 flex-col", home ? "min-h-[212px] p-3 sm:p-3.5" : "gap-1.5 p-4")}>
        {home && <div className="mb-1.5 text-[10px] text-rype-mute">{p.origin}</div>}
        <div className={cn("flex items-start justify-between gap-2", home && "flex-col gap-1")}>
          <h3 className={cn("font-display text-base font-semibold leading-tight text-rype-ink", home && "min-h-[2.5rem] text-[1.05rem]")}><Link href={`/products/${p.slug}`} className="hover:text-rype-leafDark">{shownName}</Link></h3>
          <div className={cn("shrink-0 text-right", home && "text-left")}>
            <div className="font-semibold tabular-nums">{formatEUR(shownPrice)}</div>
            <div className="text-[11px] text-rype-mute">{p.unit}</div>
          </div>
        </div>
        <p className={cn("text-xs text-rype-mute", home && "mt-2 min-h-[2.5rem] leading-4")}>{home ? shownTagline : `${p.origin} · ${shownTagline}`}</p>
        <button
          onClick={() => {
            add(p.id);
            track(addToCartEvent({
              product: p,
              quantity: 1,
              items: useCart.getState().items,
              products,
              placement,
            }));
            toast(`Added ${p.name}`);
          }}
          disabled={soldOut}
          aria-disabled={soldOut}
          className={cn(
            home ? "mt-auto inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition" : "mt-3 inline-flex items-center justify-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition",
            soldOut
              ? "cursor-not-allowed bg-rype-ink/10 text-rype-mute"
              : home ? "bg-rype-leaf text-white hover:bg-rype-leafDark active:scale-95" : "bg-rype-ink text-white hover:bg-rype-leafDark active:scale-95"
          )}
        >
          {soldOut ? "Sold out" : home ? "Add to basket" : (<><Plus className="h-4 w-4" /> Add to basket</>)}
        </button>
      </div>
    </motion.article>
  );
}
