import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ShoppingBasket,
  Check,
  Clock3,
  Heart,
  Leaf,
  Sprout,
  Star,
  Truck,
} from "lucide-react";

import { CATEGORIES, type Category } from "@/data/products";
import { ProductCard } from "@/components/product/ProductCard";
import { HOME_CATEGORY_ART, HOME_FEATURED_SLUGS, HOME_STORY_IMAGES } from "@/lib/home/presentation";
import { listFeaturedProducts, type ProductRow } from "@/lib/products/queries";
import { presentHomepageProducts } from "@/lib/products/presentation";
import styles from "./home.module.css";

export const revalidate = 60;

const CATEGORY_COPY: Record<Category, { description: string; action: string }> = {
  fruits: { description: "Sweet, seasonal, and full of flavor", action: "Shop fruits" },
  vegetables: { description: "Nutrient-rich goodness", action: "Shop vegetables" },
  herbs: { description: "Aromas that bring food to life", action: "Shop herbs" },
  bundles: { description: "Curated boxes for every table", action: "Shop bundles" },
};

export default async function Home() {
  let featured: ProductRow[] = [];
  try {
    featured = await listFeaturedProducts(8);
  } catch (error) {
    console.error("listFeaturedProducts failed on /:", error);
  }

  const bySlug = new Map(featured.map((product) => [product.slug, product]));
  const homeFeatured = HOME_FEATURED_SLUGS
    .map((slug) => bySlug.get(slug))
    .filter((product): product is ProductRow => Boolean(product));

  return (
    <div className={`${styles.home} bg-rype-cream`}>
      <Hero />

      <section className="mx-auto max-w-6xl px-4 pb-10 pt-10 sm:pb-14 sm:pt-14">
        <SectionHeading title="Shop by category" href="/products" linkLabel="View all products" />
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => {
            const copy = CATEGORY_COPY[category.id];
            return (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group relative min-h-[152px] overflow-hidden rounded-xl border border-rype-line bg-[#f0f2e3] p-4 transition duration-300 hover:-translate-y-1 hover:border-rype-leaf/40 hover:shadow-lift"
              >
                <Image
                  src={category.id === "herbs" ? "/product-images/rype-catalog/basil.svg" : HOME_CATEGORY_ART[category.id]}
                  alt={`${category.label} from the Rype market`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover object-right transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f0f2e3]/95 via-[#f0f2e3]/58 to-transparent" />
                <div className="relative flex h-full max-w-[10rem] flex-col justify-between">
                  <div>
                    <h3 className="font-display text-xl font-semibold leading-none text-rype-ink">{category.label}</h3>
                    <p className="mt-1.5 text-xs leading-4 text-rype-ink/70">{copy.description}</p>
                  </div>
                  <span className="mt-5 inline-flex items-center gap-1 text-[11px] font-semibold text-rype-leafDark">
                    {copy.action} <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
        <SectionHeading title="Featured produce" href="/products" linkLabel="View all produce" />
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {presentHomepageProducts(homeFeatured).map((product, index) => (
            <ProductCard
              key={product.id}
              p={product}
              index={index}
              variant="homepage"
              displayName={product.slug === "bundle-salad" ? "Rype Seasonal Box" : undefined}
              displayTagline={product.slug === "bundle-salad" ? "A taste of the season" : undefined}
              displayPrice={product.slug === "bundle-salad" ? 2400 : undefined}
              badge={product.slug === "bundle-salad" ? "Best value" : undefined}
            />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
        <div className="grid overflow-hidden rounded-[1.75rem] border border-[#dfe5c9] bg-[#eef2df] md:grid-cols-[1fr_1.12fr]">
          <div className="relative min-h-[250px] md:min-h-[320px]">
            <Image
              src={HOME_STORY_IMAGES.seasonalBox}
              alt="A seasonal market box filled with fresh European produce"
              fill
              sizes="(max-width: 767px) 100vw, 45vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center p-7 sm:p-8 lg:p-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-rype-leafDark">This week&apos;s box</p>
            <h2 className="mt-2 max-w-md font-display text-4xl font-semibold leading-[0.95] text-rype-ink sm:text-5xl">The Seasonal Market Box</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-rype-ink/70 sm:text-base">A handpicked selection of this week&apos;s best produce from across Europe. Fresh variety. Real flavor. A brighter tomorrow.</p>
            <Link href="/products?category=bundles" className="btn-primary mt-6 w-fit px-6">Order this box <ArrowRight className="h-4 w-4" /></Link>
            <ul className="mt-7 grid gap-2 text-xs text-rype-ink/70 sm:grid-cols-3">
              <PromiseItem>Seasonal produce</PromiseItem>
              <PromiseItem>Changes weekly</PromiseItem>
              <PromiseItem>Great value</PromiseItem>
            </ul>
          </div>
        </div>
      </section>

      <section className="border-y border-rype-line bg-white/55">
        <div className="mx-auto max-w-6xl px-4 py-9 sm:py-10">
          <h2 className="font-display text-3xl font-semibold text-rype-ink sm:text-4xl">How it works</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-0">
            <ProcessStep number="1" icon={<ShoppingBasket />} title="Pick your produce" copy="Browse our seasonal selection and add to your basket." />
            <ProcessStep number="2" icon={<Leaf />} title="We source fresh" copy="Our growers harvest at peak ripeness for best flavor." />
            <ProcessStep number="3" icon={<Truck />} title="We deliver quickly" copy="From farm to your door within 24 hours in selected delivery areas." />
            <ProcessStep number="4" icon={<Heart />} title="Enjoy peak flavor" copy="Unpack, cook, and taste the difference." />
          </div>
          <div className="mt-8 grid border-t border-rype-line pt-7 lg:grid-cols-[1.2fr_2fr] lg:items-center">
            <div className="pb-7 lg:border-r lg:border-rype-line lg:pb-0 lg:pr-8">
              <h2 className="font-display text-3xl font-semibold leading-none text-rype-ink sm:text-4xl">The Rype promise</h2>
              <p className="mt-2 font-display text-xl leading-tight text-rype-leafDark sm:text-2xl">Better food for brighter days.</p>
              <p className="mt-2 max-w-sm text-sm leading-5 text-rype-ink/70">We work with European growers, prioritize seasonal produce, and stand behind every box we deliver.</p>
            </div>
            <div className="grid grid-cols-2 gap-y-7 border-t border-rype-line pt-7 sm:grid-cols-4 sm:gap-0 sm:border-t-0 sm:pt-0 lg:pl-6">
              <Metric icon={<Sprout />} value="120+" label="Farms sourced from across Europe" />
              <Metric icon={<Clock3 />} value="24h" label="In selected delivery areas" />
              <Metric icon={<Leaf />} value="68%" label="Organic selection" />
              <Metric icon={<Star />} value="9.6/10" label="Freshness score from 5,000+ customers" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-3 pb-5 sm:pt-4 sm:pb-6">
        <div className="grid gap-5 lg:grid-cols-[0.88fr_1.7fr] lg:items-stretch">
          <div className="grid overflow-hidden rounded-xl border border-rype-line bg-[#f0f2e3] sm:grid-cols-[0.9fr_1.1fr]">
            <div className="relative min-h-[150px]"><Image src={HOME_STORY_IMAGES.growers} alt="A Rype grower tending fruit in a European orchard" fill sizes="(max-width: 1024px) 50vw, 34vw" className="object-cover" /></div>
            <div className="p-4 sm:p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-rype-leafDark">Our growers</p>
              <h2 className="mt-1.5 font-display text-2xl font-semibold leading-[0.95] text-rype-ink">Rooted in a brighter Europe</h2>
              <p className="mt-2 text-xs leading-5 text-rype-ink/70">We partner with family farms across Europe who share our belief in better food for people and the planet.</p>
            </div>
          </div>

          <div>
            <div className="flex items-end justify-between gap-4"><h2 className="font-display text-2xl font-semibold text-rype-ink sm:text-3xl">What our customers say</h2></div>
            <div className="mt-2.5 grid gap-2.5 sm:grid-cols-3">
              <Testimonial name="Emma L." location="Barcelona, Spain" copy="The produce is so fresh and full of flavor. You can really taste the difference!" />
              <Testimonial name="James T." location="Berlin, Germany" copy="Rype makes it easy to eat seasonally. Beautiful quality and amazing service." />
              <Testimonial name="Sophie M." location="Amsterdam, Netherlands" copy="Our weekly box is the highlight of the week. Fresh, delicious, and so well curated!" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:pb-16">
        <div className="relative flex flex-col gap-3 overflow-hidden rounded-xl border border-[#dfe5c9] bg-[#eef2df] px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div className="absolute -left-8 -top-12 text-rype-leaf/25"><Leaf className="h-24 w-24 -rotate-45" /></div>
          <div className="relative"><h2 className="font-display text-xl font-semibold leading-none text-rype-ink">Good food, brighter days.</h2><p className="mt-1 text-sm text-rype-ink/75">Find your seasonal favorites and make your next meal something special.</p></div>
          <Link href="/products" className="btn-primary relative shrink-0">Explore the market <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-rype-line bg-[#fbfaf3] xl:aspect-[2056/765]">
      <Image
        src={HOME_STORY_IMAGES.hero}
        alt="A European shopper carrying a bag of fresh seasonal groceries"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-full bg-gradient-to-r from-[#fbfaf3]/95 via-[#fbfaf3]/70 to-transparent lg:hidden" />
      <div className="relative mx-auto min-h-[680px] max-w-6xl px-4 sm:min-h-[600px] sm:px-6 lg:min-h-[590px] lg:px-8 xl:h-full xl:min-h-0">
        <div className="flex min-h-[680px] items-center sm:min-h-[600px] lg:min-h-[590px] xl:h-full xl:min-h-0">
          <div className="relative z-10 max-w-xl">
          <h1 className="max-w-md font-display text-5xl font-semibold leading-[0.9] tracking-tight text-rype-ink sm:text-6xl lg:text-7xl">Ripe today.<br />Ready<br /><span className="italic text-rype-leafDark">tomorrow</span><span className="text-rype-orange">.</span></h1>
          <p className="mt-6 max-w-md text-sm leading-6 text-rype-ink/70 sm:max-w-[23rem] sm:text-base lg:max-w-md xl:mt-5">Rype sources the finest fruits, vegetables and herbs from European growers who pick for flavor first, then delivers them to your doorstep, fresh, fragrant, and ready to enjoy.</p>
          <div className="mt-6 flex flex-wrap gap-3 xl:mt-4"><Link href="/products" className="btn-primary px-6 py-3">Shop the market <ArrowRight className="h-4 w-4" /></Link><Link href="/products?category=bundles" className="btn-outline px-6 py-3">This week&apos;s boxes</Link></div>
          <div className="mt-7 grid max-w-lg grid-cols-2 gap-x-3 gap-y-3 border-t border-rype-line pt-5 sm:max-w-[23rem] lg:max-w-lg lg:grid-cols-3 xl:mt-4 xl:pt-4"><Proof icon={<Truck />} label="24h delivery" detail="In selected areas" /><Proof icon={<Leaf />} label="Freshness guaranteed" detail="We make it right" /><Proof icon={<Sprout />} label="Seasonal sourcing" detail="From European growers" /></div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SectionHeading({ title, href, linkLabel }: { title: string; href: string; linkLabel: string }) {
  return <div className="flex items-end justify-between gap-4"><h2 className="font-display text-3xl font-semibold leading-none text-rype-ink sm:text-4xl">{title}</h2><Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-rype-leafDark hover:underline">{linkLabel} <ArrowRight className="h-3.5 w-3.5" /></Link></div>;
}

function Proof({ icon, label, detail }: { icon: React.ReactNode; label: string; detail: string }) {
  return <div className="flex min-w-0 items-start gap-2"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#edf1db] text-rype-leafDark [&>*]:h-4 [&>*]:w-4">{icon}</span><span className="min-w-0 pt-0.5"><span className="block text-[10px] font-semibold leading-3 text-rype-ink">{label}</span><span className="mt-0.5 block text-[9px] leading-3 text-rype-mute">{detail}</span></span></div>;
}

function PromiseItem({ children }: { children: React.ReactNode }) {
  return <li className="flex items-center gap-2"><span className="grid h-5 w-5 place-items-center rounded-full bg-rype-leaf/15 text-rype-leafDark"><Check className="h-3 w-3" /></span>{children}</li>;
}

function ProcessStep({ number, icon, title, copy }: { number: string; icon: React.ReactNode; title: string; copy: string }) {
  return <div className="flex gap-3 border-rype-line lg:border-r lg:px-6 first:pl-0 last:border-0 last:pr-0"><span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#edf1db] text-rype-leafDark [&>*]:h-5 [&>*]:w-5">{icon}</span><div><p className="text-sm font-semibold text-rype-ink"><span className="mr-1 text-rype-leafDark">{number}.</span>{title}</p><p className="mt-1 text-xs leading-5 text-rype-mute">{copy}</p></div></div>;
}

function Metric({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return <div className="flex flex-col items-center text-center sm:border-r sm:border-rype-line sm:px-4 first:pl-0 last:border-0 last:pr-0"><span className="text-rype-leafDark [&>*]:h-5 [&>*]:w-5">{icon}</span><strong className="mt-2 font-display text-3xl font-semibold text-rype-ink">{value}</strong><span className="mt-1 max-w-[10rem] text-[10px] leading-4 text-rype-mute">{label}</span></div>;
}

function Testimonial({ name, location, copy }: { name: string; location: string; copy: string }) {
  return <article className="rounded-xl border border-rype-line bg-white p-3"><div className="flex items-center gap-0.5 text-rype-orange">{Array.from({ length: 5 }).map((_, index) => <Star key={index} className="h-2.5 w-2.5 fill-current" />)}</div><p className="mt-2 text-[11px] leading-4 text-rype-ink/75">“{copy}”</p><div className="mt-3 flex items-center gap-2 border-t border-rype-line pt-2"><span className="grid h-6 w-6 place-items-center rounded-full bg-[#edf1db] text-[10px] font-semibold text-rype-leafDark">{name[0]}</span><span><strong className="block text-[10px] leading-3 text-rype-ink">{name}</strong><span className="block text-[9px] leading-3 text-rype-mute">{location}</span></span></div></article>;
}
