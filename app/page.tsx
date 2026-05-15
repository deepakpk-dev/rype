import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Truck, Sparkles, Shield } from "lucide-react";
import { CATEGORIES } from "@/data/products";
import { listFeaturedProducts, type ProductRow } from "@/lib/products/queries";
import { ProductCard } from "@/components/product/ProductCard";
import { HOME_HERO_IMAGE, presentHomepageProducts } from "@/lib/products/presentation";

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
      <section className="overflow-hidden border-b border-rype-line bg-rype-cream">
        <div className="grid h-1 grid-cols-3">
          <div className="bg-rype-leaf" />
          <div className="bg-rype-yellow" />
          <div className="bg-rype-orange" />
        </div>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 lg:grid-cols-[1fr_0.95fr] lg:items-center lg:gap-14 lg:py-20">
          <div className="animate-fade-up">
            <div className="font-display text-[clamp(4.5rem,14vw,11rem)] font-semibold leading-[0.82] tracking-tight text-rype-ink">
              <span>R</span>
              <span className="italic text-rype-red">y</span>
              <span>p</span>
              <span className="italic text-rype-orange">e</span>
              <span>.</span>
            </div>

            <div className="mt-7 border-t border-rype-line pt-7">
              <div className="grid gap-7 xl:grid-cols-[0.9fr_1fr] xl:gap-12">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-rype-mute">
                    Peak-season groceries
                  </div>
                  <h1 className="mt-4 max-w-xl font-display text-4xl font-semibold leading-[1.06] tracking-tight text-rype-ink sm:text-5xl">
                    Ripe today.
                    <br />
                    Ready tomorrow.
                  </h1>
                </div>

                <div className="flex flex-col justify-end">
                  <p className="max-w-xl text-base leading-8 text-rype-ink/76 sm:text-lg">
                    Rype sources fruit, vegetables, herbs, and market boxes from growers who pick for flavor first, then delivers them fast so everything arrives fresh, fragrant, and ready to use.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/products" className="btn-primary px-7 py-3">
                      Shop the market <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link href="/products?category=bundles" className="btn-outline px-7 py-3">
                      This week&apos;s boxes
                    </Link>
                  </div>

                  <div className="mt-8 grid grid-cols-1 gap-3 border-t border-rype-line pt-5 text-sm sm:grid-cols-3">
                    <Feat icon={<Truck />} label="24h delivery" />
                    <Feat icon={<Shield />} label="Freshness guaranteed" />
                    <Feat icon={<Sparkles />} label="Seasonal sourcing" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-[2rem] border border-rype-line bg-white shadow-lift lg:min-h-full">
            <Image
              src={HOME_HERO_IMAGE.src}
              alt={HOME_HERO_IMAGE.alt}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 46vw"
              className="object-cover"
            />
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
          {CATEGORIES.map((c, i) => (
            <Link
              key={c.id}
              href={`/products?category=${c.id}`}
              className="card group flex flex-col items-start justify-between gap-6 p-5 transition hover:-translate-y-1 hover:border-rype-leaf hover:shadow-lift"
            >
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-rype-leafDark">
                {String(i + 1).padStart(2, "0")}
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
          {presentHomepageProducts(featured).map((p, i) => (
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
                Picked with standards you can taste.
              </h2>
              <p className="mt-4 max-w-lg text-white/70">
                Every order is packed for ripeness, handled through a cold-chain route, and backed by a simple promise:
                if the quality is not right, we make it right.
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
    <div className="flex items-center gap-2 text-rype-ink/78">
      <span className="text-rype-leafDark [&>*]:h-4 [&>*]:w-4">{icon}</span>
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}
