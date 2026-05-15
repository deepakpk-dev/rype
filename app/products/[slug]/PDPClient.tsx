"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, Scale, Leaf, MapPin, Minus, Plus, ShoppingBasket, Truck, Shield } from "lucide-react";
import confetti from "canvas-confetti";
import { formatEUR, cn } from "@/lib/utils";
import { useCart, useWishlist, useCompare } from "@/lib/stores";
import { ProductCard } from "@/components/product/ProductCard";
import { toast } from "@/components/ui/Toaster";
import type { Nutrition, ProductRow } from "@/lib/products/queries";

export default function PDPClient({
  product: p,
  nutrition,
  related,
}: {
  product: ProductRow;
  nutrition: Nutrition;
  related: ProductRow[];
}) {
  const [imageIndex, setImageIndex] = useState(0);
  const [qty, setQty] = useState(1);
  const add = useCart((s) => s.add);
  const wl = useWishlist();
  const cmp = useCompare();

  const inWl = wl.has(p.id);
  const inCmp = cmp.has(p.id);

  const onAdd = () => {
    add(p.id, qty);
    toast(`Added ${qty} × ${p.name}`);
  };

  const onWish = () => {
    wl.toggle(p.id);
    if (!inWl) {
      confetti({
        particleCount: 40,
        spread: 55,
        startVelocity: 28,
        origin: { x: 0.85, y: 0.35 },
        colors: ["#E63946", "#F4D03F", "#F39C12", "#7CB342"],
      });
      toast("Saved to wishlist");
    } else {
      toast("Removed from wishlist");
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-6 text-xs text-rype-mute">
        <Link href="/products" className="hover:underline">All produce</Link>
        <span className="mx-2">/</span>
        <Link href={`/products?category=${p.category}`} className="hover:underline capitalize">
          {p.category}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-rype-ink">{p.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        {/* Gallery */}
        <div>
          <div className="relative aspect-square overflow-hidden rounded-3xl border border-rype-line bg-[#fffaf2] shadow-soft">
            <AnimatePresence mode="wait">
              <motion.div
                key={imageIndex}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="absolute inset-0"
              >
                <Image
                  src={p.images[imageIndex]}
                  alt={p.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-contain p-8 sm:p-10"
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {p.organic && (
                <span className="inline-flex items-center gap-1 rounded-full bg-rype-leaf px-3 py-1 text-xs font-semibold text-white">
                  <Leaf className="h-3 w-3" /> Organic
                </span>
              )}
              {p.inSeason && (
                <span className="inline-flex w-fit items-center rounded-full bg-rype-yellow px-3 py-1 text-xs font-semibold text-rype-ink">
                  In season
                </span>
              )}
            </div>
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {p.images.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setImageIndex(i)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-xl border-2 bg-[#fffaf2]",
                    i === imageIndex ? "border-rype-leafDark" : "border-transparent opacity-70 hover:opacity-100"
                  )}
                >
                  <Image src={src} alt="" fill sizes="120px" className="object-contain p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2 text-sm text-rype-mute">
            <MapPin className="h-3.5 w-3.5" /> From {p.origin}
          </div>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            {p.name}
          </h1>
          <p className="mt-2 text-lg text-rype-ink/70">{p.tagline}</p>

          <div className="mt-6 flex items-baseline gap-3">
            <span className="font-display text-3xl font-semibold">{formatEUR(p.price)}</span>
            <span className="text-sm text-rype-mute">/ {p.unit}</span>
          </div>

          <p className="mt-6 max-w-prose text-rype-ink/80">{p.description}</p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1 rounded-full border border-rype-line bg-white p-1">
              <button
                aria-label="Decrease"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="rounded-full p-2 hover:bg-rype-ink/5"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="w-8 text-center text-sm font-medium tabular-nums">{qty}</span>
              <button
                aria-label="Increase"
                onClick={() => setQty((q) => q + 1)}
                className="rounded-full p-2 hover:bg-rype-ink/5"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button onClick={onAdd} className="btn-primary flex-1 sm:flex-none">
              <ShoppingBasket className="h-4 w-4" /> Add to basket · {formatEUR(p.price * qty)}
            </button>
            <button
              onClick={onWish}
              aria-label="Wishlist"
              className={cn("btn-outline !px-3", inWl && "border-rype-red text-rype-red")}
            >
              <Heart className={cn("h-4 w-4", inWl && "fill-current")} />
            </button>
            <button
              onClick={() => cmp.toggle(p.id)}
              aria-label="Compare"
              className={cn("btn-outline !px-3", inCmp && "border-rype-leaf text-rype-leafDark")}
            >
              <Scale className="h-4 w-4" />
            </button>
          </div>

          <ul className="mt-8 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <Truck className="mt-0.5 h-4 w-4 text-rype-leafDark" />
              <span><strong>24h delivery</strong><br /><span className="text-rype-mute">Free over €50</span></span>
            </li>
            <li className="flex items-start gap-2">
              <Shield className="mt-0.5 h-4 w-4 text-rype-leafDark" />
              <span><strong>Freshness guaranteed</strong><br /><span className="text-rype-mute">Or we replace it</span></span>
            </li>
          </ul>

          <div className="mt-10 rounded-2xl border border-rype-line bg-white p-5">
            <h2 className="mb-3 font-display text-lg font-semibold">Per 100 g</h2>
            <dl className="grid grid-cols-4 gap-3 text-center">
              {[
                { l: "Calories", v: nutrition.calories, u: "kcal" },
                { l: "Carbs", v: nutrition.carbs, u: "g" },
                { l: "Protein", v: nutrition.protein, u: "g" },
                { l: "Fiber", v: nutrition.fiber, u: "g" },
              ].map((n) => (
                <div key={n.l}>
                  <dt className="text-xs text-rype-mute">{n.l}</dt>
                  <dd className="font-display text-xl font-semibold text-rype-ink">
                    {n.v}
                    <span className="text-xs text-rype-mute">{n.u}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 font-display text-2xl font-semibold sm:text-3xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((r, i) => (
              <ProductCard key={r.id} p={r} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
