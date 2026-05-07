"use client";
import { AnimatePresence, motion } from "framer-motion";
import Fuse from "fuse.js";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Leaf } from "lucide-react";
import { PRODUCTS } from "@/data/products";
import { formatEUR } from "@/lib/utils";

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fuse = useMemo(
    () =>
      new Fuse(PRODUCTS, {
        keys: ["name", "tagline", "description", "tags", "origin"],
        threshold: 0.35,
      }),
    []
  );

  const onAdmin = pathname?.startsWith("/admin");

  const results = useMemo(() => {
    if (!q.trim()) return PRODUCTS.slice(0, 6);
    return fuse.search(q).slice(0, 8).map((r) => r.item);
  }, [q, fuse]);

  useEffect(() => {
    if (onAdmin) return;
    const openHandler = () => setOpen(true);
    const keyHandler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("rype:open-search", openHandler);
    window.addEventListener("keydown", keyHandler);
    return () => {
      window.removeEventListener("rype:open-search", openHandler);
      window.removeEventListener("keydown", keyHandler);
    };
  }, [onAdmin]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else {
      setQ("");
      setActive(0);
    }
  }, [open]);

  const navigate = (slug: string) => {
    setOpen(false);
    router.push(`/products/${slug}`);
  };

  if (onAdmin) return null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-rype-ink/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            className="fixed left-1/2 top-24 z-[90] w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl bg-white shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-rype-line px-4 py-3">
              <Search className="h-4 w-4 text-rype-mute" />
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((a) => Math.min(a + 1, results.length - 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((a) => Math.max(0, a - 1));
                  } else if (e.key === "Enter") {
                    const r = results[active];
                    if (r) navigate(r.slug);
                  }
                }}
                placeholder="Search for apples, basil, bundles…"
                className="flex-1 bg-transparent text-base outline-none placeholder:text-rype-mute"
              />
              <kbd className="rounded bg-rype-ink/5 px-1.5 py-0.5 text-[10px] text-rype-mute">ESC</kbd>
              <button onClick={() => setOpen(false)} className="rounded-full p-1 hover:bg-rype-ink/5">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-2">
              {results.length === 0 ? (
                <li className="flex items-center gap-3 px-3 py-8 text-sm text-rype-mute">
                  <Leaf className="h-4 w-4" /> No matches. Try "apple" or "basil".
                </li>
              ) : (
                results.map((p, i) => (
                  <li key={p.id}>
                    <button
                      onMouseEnter={() => setActive(i)}
                      onClick={() => navigate(p.slug)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        i === active ? "bg-rype-leaf/10" : "hover:bg-rype-ink/5"
                      }`}
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-lg">
                        <Image src={p.images[0]} alt={p.name} fill sizes="40px" className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate font-medium">{p.name}</div>
                        <div className="truncate text-xs text-rype-mute">{p.tagline} · {p.origin}</div>
                      </div>
                      <div className="text-sm font-medium">{formatEUR(p.price)}</div>
                    </button>
                  </li>
                ))
              )}
            </ul>
            <div className="flex items-center justify-between border-t border-rype-line bg-rype-cream px-4 py-2 text-[11px] text-rype-mute">
              <span>↑↓ navigate · ↵ open</span>
              <span>Press ⌘K anywhere</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
