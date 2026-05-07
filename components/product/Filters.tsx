"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { CATEGORIES, ORIGINS } from "@/data/products";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export function Filters() {
  const router = useRouter();
  const sp = useSearchParams();

  const set = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(sp.toString());
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
      router.replace(`/products?${params.toString()}`, { scroll: false });
    },
    [router, sp]
  );

  const category = sp.get("category") || "";
  const origin = sp.get("origin") || "";
  const organic = sp.get("organic") === "1";
  const inSeason = sp.get("inSeason") === "1";
  const maxPrice = sp.get("maxPrice");

  const clear = () => router.replace("/products", { scroll: false });
  const any = category || origin || organic || inSeason || maxPrice;

  return (
    <div className="space-y-6">
      <Section title="Category">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => set("category", null)}
            className={cn("chip", !category && "chip-active")}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => set("category", category === c.id ? null : c.id)}
              className={cn("chip", category === c.id && "chip-active")}
            >
              <span>{c.emoji}</span> {c.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Origin">
        <div className="flex flex-wrap gap-2">
          {ORIGINS.map((o) => (
            <button
              key={o}
              onClick={() => set("origin", origin === o ? null : o)}
              className={cn("chip", origin === o && "chip-active")}
            >
              {o}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Price">
        <input
          type="range"
          min={100}
          max={2000}
          step={50}
          value={maxPrice ? Number(maxPrice) : 2000}
          onChange={(e) =>
            set("maxPrice", e.target.value === "2000" ? null : e.target.value)
          }
          className="w-full accent-rype-leafDark"
        />
        <div className="flex justify-between text-xs text-rype-mute">
          <span>€1</span>
          <span>{maxPrice ? `up to €${(Number(maxPrice) / 100).toFixed(0)}` : "up to €20"}</span>
        </div>
      </Section>

      <Section title="Quality">
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={organic}
            onChange={(e) => set("organic", e.target.checked ? "1" : null)}
            className="h-4 w-4 accent-rype-leafDark"
          />
          Organic only
        </label>
        <label className="flex cursor-pointer items-center gap-2 py-1 text-sm">
          <input
            type="checkbox"
            checked={inSeason}
            onChange={(e) => set("inSeason", e.target.checked ? "1" : null)}
            className="h-4 w-4 accent-rype-leafDark"
          />
          In season
        </label>
      </Section>

      {any && (
        <button
          onClick={clear}
          className="flex w-full items-center justify-center gap-1 rounded-xl border border-rype-line py-2 text-xs text-rype-mute hover:border-rype-red hover:text-rype-red"
        >
          <X className="h-3 w-3" /> Clear all
        </button>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-rype-mute">
        {title}
      </div>
      {children}
    </div>
  );
}
