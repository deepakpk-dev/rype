"use client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Minus, Plus, Trash2, X, ShoppingBasket, ArrowRight } from "lucide-react";
import { useCart, cartTotals } from "@/lib/stores";
import { PRODUCTS } from "@/data/products";
import { formatEUR } from "@/lib/utils";

export function CartDrawer() {
  const pathname = usePathname();
  const { items, drawerOpen, closeDrawer, setQty, remove } = useCart();
  if (pathname?.startsWith("/admin")) return null;
  const { subtotal, shipping, total, FREE_SHIPPING_AT } = cartTotals(items, PRODUCTS);
  const progress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_AT) * 100));
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-rype-ink/40 backdrop-blur-sm"
            onClick={closeDrawer}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 280 }}
            className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-md flex-col bg-rype-cream shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-rype-line px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBasket className="h-5 w-5 text-rype-leafDark" />
                <h2 className="font-display text-xl">Your basket</h2>
              </div>
              <button
                onClick={closeDrawer}
                aria-label="Close"
                className="rounded-full p-2 hover:bg-rype-ink/5"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            {subtotal > 0 && (
              <div className="border-b border-rype-line px-5 py-3">
                <div className="mb-1.5 flex justify-between text-xs text-rype-mute">
                  <span>
                    {remaining > 0
                      ? `Add ${formatEUR(remaining)} for free delivery`
                      : "You got free delivery 🎉"}
                  </span>
                  <span>{progress}%</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-rype-ink/5">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rype-leaf to-rype-orange"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
                  <div className="text-6xl">🧺</div>
                  <div>
                    <div className="font-display text-lg">Your basket is empty</div>
                    <p className="text-sm text-rype-mute">Fresh produce is just a click away.</p>
                  </div>
                  <Link href="/products" onClick={closeDrawer} className="btn-primary">
                    Start shopping
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-rype-line">
                  <AnimatePresence initial={false}>
                    {items.map((item) => {
                      const p = PRODUCTS.find((x) => x.id === item.productId);
                      if (!p) return null;
                      return (
                        <motion.li
                          key={item.productId}
                          layout
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                          className="flex gap-3 p-4"
                        >
                          <Link
                            href={`/products/${p.slug}`}
                            onClick={closeDrawer}
                            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-white"
                          >
                            <Image
                              src={p.images[0]}
                              alt={p.name}
                              fill
                              sizes="80px"
                              className="object-cover"
                            />
                          </Link>
                          <div className="flex flex-1 flex-col">
                            <div className="flex justify-between gap-2">
                              <div>
                                <div className="font-medium leading-tight">{p.name}</div>
                                <div className="text-xs text-rype-mute">{p.unit}</div>
                              </div>
                              <div className="text-right font-medium">
                                {formatEUR(p.price * item.qty)}
                              </div>
                            </div>
                            <div className="mt-auto flex items-center justify-between">
                              <QtyStepper
                                value={item.qty}
                                onDec={() => setQty(p.id, item.qty - 1)}
                                onInc={() => setQty(p.id, item.qty + 1)}
                              />
                              <button
                                onClick={() => remove(p.id)}
                                className="rounded-full p-1.5 text-rype-mute hover:bg-rype-red/10 hover:text-rype-red"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-rype-line bg-white px-5 py-4">
                <dl className="mb-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-rype-mute">Subtotal</dt>
                    <dd>{formatEUR(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-rype-mute">Delivery</dt>
                    <dd>{shipping === 0 ? "Free" : formatEUR(shipping)}</dd>
                  </div>
                  <div className="flex justify-between border-t border-rype-line pt-2 text-base font-semibold">
                    <dt>Total</dt>
                    <dd>{formatEUR(total)}</dd>
                  </div>
                </dl>
                <Link
                  href="/checkout"
                  onClick={closeDrawer}
                  className="btn-primary w-full"
                >
                  Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function QtyStepper({
  value,
  onInc,
  onDec,
}: {
  value: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-rype-line bg-white">
      <button
        aria-label="Decrease"
        onClick={onDec}
        className="rounded-full p-1.5 hover:bg-rype-ink/5"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-6 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        aria-label="Increase"
        onClick={onInc}
        className="rounded-full p-1.5 hover:bg-rype-ink/5"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
