import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Leaf, Truck, Sparkles, Shield } from "lucide-react";
import { CATEGORIES } from "@/data/products";
import { listFeaturedProducts, type ProductRow } from "@/lib/products/queries";
import { ProductCard } from "@/components/product/ProductCard";

export const revalidate = 60;

export default async function Home() {
  let featured: ProductRow[] = [];
  try {
    featured = await listFeaturedProducts(8);
  } catch (e) {
    console.error("listFeaturedProducts failed on /:", e);
  }
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-2 lg:py-20">
          <div className="relative z-10 animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-rype-leaf/30 bg-rype-leaf/10 px-3 py-1 text-xs font-medium text-rype-leafDark">
              <Leaf className="h-3 w-3" /> This week in season · asparagus, strawberries, basil
            </span>
            <h1 className="mt-5 font-display text-5xl font-semibold leading-[1.05] tracking-tight text-rype-ink sm:text-6xl lg:text-7xl">
              Fresh produce,<br />
              <span className="italic text-rype-leafDark">ripe</span> at your door.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-rype-ink/70">
              Small-farm European fruits, vegetables, and herbs — picked in the morning, at your door tomorrow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="btn-primary">
                Shop fresh <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/products?category=bundles" className="btn-outline">
                Browse bundles
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 border-t border-rype-line pt-6 text-sm">
              <Feat icon={<Truck />} label="24h delivery" />
              <Feat icon={<Shield />} label="Freshness guaranteed" />
              <Feat icon={<Sparkles />} label="Small farms only" />
            </div>
          </div>

          <div className="relative aspect-[5/6] w-full max-w-lg justify-self-center">
            <div className="absolute -left-6 -top-6 h-40 w-40 rounded-full bg-rype-yellow/50 blur-3xl" />
            <div className="absolute -bottom-8 -right-8 h-48 w-48 rounded-full bg-rype-orange/40 blur-3xl" />
            <div className="relative grid h-full grid-cols-2 grid-rows-2 gap-3">
              <div className="relative col-span-2 overflow-hidden rounded-3xl bg-white shadow-lift">
                <Image
                  src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1200&q=75"
                  alt="Fresh produce"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-lift">
                <Image
                  src="https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=800&q=75"
                  alt="Strawberries"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative overflow-hidden rounded-3xl bg-white shadow-lift">
                <Image
                  src="https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&w=800&q=75"
                  alt="Tomatoes"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 pb-10 pt-6 sm:pb-14 sm:pt-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">Shop by category</h2>
          <Link href="/products" className="text-sm text-rype-leafDark hover:underline">
            See everything →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className="card group flex flex-col items-start justify-between gap-6 p-5 transition hover:-translate-y-1 hover:border-rype-leaf hover:shadow-lift"
            >
              <span className="text-5xl transition-transform group-hover:-rotate-6 group-hover:scale-110">
                {c.emoji}
              </span>
              <div>
                <div className="font-display text-xl font-semibold">{c.label}</div>
                <div className="text-xs text-rype-mute">{c.blurb}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:pb-20 sm:pt-14">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-rype-leafDark">
              This week&apos;s pick
            </span>
            <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Featured produce
            </h2>
          </div>
          <Link href="/products" className="text-sm text-rype-leafDark hover:underline">
            View all →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {featured.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </section>

      {/* PROMISE */}
      <section className="mx-auto mb-20 mt-0 max-w-7xl px-4">
        <div className="overflow-hidden rounded-3xl bg-rype-ink p-10 text-white lg:p-16">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="text-xs font-medium uppercase tracking-wider text-rype-leaf">The Rype promise</span>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight sm:text-4xl">
                Never mealy. Never last week&apos;s. Ever.
              </h2>
              <p className="mt-4 max-w-lg text-white/70">
                Every piece of produce is picked to order and cold-chain shipped from a small European farm we know by name.
                If something isn&apos;t perfect, we replace it — no questions, no emails.
              </p>
              <Link href="/products" className="mt-6 inline-flex btn-primary">
                Start shopping
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { k: "Farms we source from", v: "120+" },
                { k: "Avg. time farm → door", v: "22h" },
                { k: "Organic selection", v: "68%" },
                { k: "Freshness score", v: "9.6/10" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl bg-white/5 p-5">
                  <div className="font-display text-3xl font-semibold text-rype-yellow">{s.v}</div>
                  <div className="mt-1 text-sm text-white/60">{s.k}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-rype-ink/80">
      <span className="text-rype-leafDark [&>*]:h-4 [&>*]:w-4">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
