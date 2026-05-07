"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, CreditCard, MapPin, Calendar } from "lucide-react";
import { useCart, cartTotals } from "@/lib/stores";
import { placeOrderAction } from "@/lib/orders/actions";
import { decrementStockAction } from "@/lib/products/actions";
import { PRODUCTS } from "@/data/products";
import { formatEUR, cn } from "@/lib/utils";

const addressSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  firstName: z.string().min(1, "Required"),
  lastName: z.string().min(1, "Required"),
  address: z.string().min(1, "Required"),
  city: z.string().min(1, "Required"),
  postalCode: z.string().min(3, "Required"),
  country: z.string().min(1, "Required"),
  phone: z.string().optional(),
});

type Address = z.infer<typeof addressSchema>;

const DELIVERY_SLOTS = [
  { id: "tomorrow-am", label: "Tomorrow, 8–12", price: 0 },
  { id: "tomorrow-pm", label: "Tomorrow, 14–18", price: 0 },
  { id: "saturday-am", label: "Saturday, 9–13", price: 199 },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clear } = useCart();
  const totals = cartTotals(items, PRODUCTS);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [slot, setSlot] = useState(DELIVERY_SLOTS[0].id);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<Address>({
    resolver: zodResolver(addressSchema),
    defaultValues: { country: "Ireland" },
  });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-display text-3xl">Your basket is empty</h1>
        <p className="mt-2 text-rype-mute">Add a few things before checking out.</p>
        <Link href="/products" className="btn-primary mt-6 inline-flex">Shop fresh</Link>
      </div>
    );
  }

  const next = async () => {
    if (step === 1) {
      const ok = await trigger();
      if (ok) setStep(2);
    } else if (step === 2) setStep(3);
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    // Simulate Stripe test checkout — in production this would POST to /api/checkout
    // and redirect to a Stripe-hosted page. For v1 we run a mock pay flow.
    await new Promise((r) => setTimeout(r, 800));

    const orderItems = items.map((i) => {
      const p = PRODUCTS.find((x) => x.id === i.productId)!;
      return { productId: p.id, name: p.name, qty: i.qty, price: p.price };
    });

    const res = await placeOrderAction({
      customer: {
        name: `${values.firstName} ${values.lastName}`,
        email: values.email,
        address: values.address,
        city: values.city,
        zip: values.postalCode,
        country: values.country,
      },
      items: orderItems,
      subtotal: totals.subtotal,
      shipping: totals.shipping,
      total: totals.total,
    });

    if (!res.ok) {
      setSubmitting(false);
      alert(res.error);
      return;
    }

    // Decrement stock atomically in the DB. Best-effort — if it fails the
    // order is still placed (stock is a soft constraint, not money).
    await decrementStockAction(
      items.map((i) => ({ productId: i.productId, qty: i.qty }))
    );

    clear();
    router.push(`/checkout/success?order=${res.id}`);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-rype-mute hover:text-rype-ink">
        <ArrowLeft className="h-4 w-4" /> Continue shopping
      </Link>
      <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Checkout</h1>

      {/* Steps */}
      <ol className="mt-6 flex items-center gap-3 text-sm">
        {[
          { n: 1, label: "Address", icon: MapPin },
          { n: 2, label: "Delivery", icon: Calendar },
          { n: 3, label: "Payment", icon: CreditCard },
        ].map((s, i) => (
          <li key={s.n} className="flex items-center gap-3">
            <div
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 transition",
                step >= s.n ? "bg-rype-leaf text-white" : "bg-white text-rype-mute"
              )}
            >
              <s.icon className="h-3.5 w-3.5" />
              <span className="font-medium">{s.label}</span>
            </div>
            {i < 2 && <div className="h-px w-6 bg-rype-line" />}
          </li>
        ))}
      </ol>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_380px]">
        <form onSubmit={onSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.section
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card p-6"
              >
                <h2 className="mb-4 font-display text-2xl">Delivery address</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="Email" full error={errors.email?.message}>
                    <input className="input" type="email" autoComplete="email" {...register("email")} />
                  </Field>
                  <Field label="First name" error={errors.firstName?.message}>
                    <input className="input" autoComplete="given-name" {...register("firstName")} />
                  </Field>
                  <Field label="Last name" error={errors.lastName?.message}>
                    <input className="input" autoComplete="family-name" {...register("lastName")} />
                  </Field>
                  <Field label="Street address" full error={errors.address?.message}>
                    <input className="input" autoComplete="street-address" {...register("address")} />
                  </Field>
                  <Field label="City" error={errors.city?.message}>
                    <input className="input" autoComplete="address-level2" {...register("city")} />
                  </Field>
                  <Field label="Postal code" error={errors.postalCode?.message}>
                    <input className="input" autoComplete="postal-code" {...register("postalCode")} />
                  </Field>
                  <Field label="Country" error={errors.country?.message}>
                    <select className="input" {...register("country")}>
                      {["Ireland", "Germany", "France", "Netherlands", "Belgium", "Spain", "Italy"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Phone (optional)" error={errors.phone?.message}>
                    <input className="input" type="tel" autoComplete="tel" {...register("phone")} />
                  </Field>
                </div>
              </motion.section>
            )}

            {step === 2 && (
              <motion.section
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card p-6"
              >
                <h2 className="mb-4 font-display text-2xl">Pick a delivery slot</h2>
                <div className="space-y-2">
                  {DELIVERY_SLOTS.map((s) => (
                    <label
                      key={s.id}
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border bg-white px-4 py-3 transition",
                        slot === s.id ? "border-rype-leaf bg-rype-leaf/5" : "border-rype-line hover:border-rype-leaf/60"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="slot"
                          className="accent-rype-leafDark"
                          checked={slot === s.id}
                          onChange={() => setSlot(s.id)}
                        />
                        <div>
                          <div className="font-medium">{s.label}</div>
                          <div className="text-xs text-rype-mute">Cold-chain delivery</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium">
                        {s.price === 0 ? "Free" : formatEUR(s.price)}
                      </div>
                    </label>
                  ))}
                </div>
              </motion.section>
            )}

            {step === 3 && (
              <motion.section
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="card p-6"
              >
                <h2 className="mb-4 font-display text-2xl">Payment</h2>
                <div className="rounded-xl border border-dashed border-rype-line bg-rype-cream p-4 text-sm">
                  <div className="mb-1 flex items-center gap-2 font-medium">
                    <CreditCard className="h-4 w-4 text-rype-leafDark" /> Test-mode Stripe Checkout
                  </div>
                  <p className="text-rype-mute">
                    Plug in your <code className="rounded bg-white px-1">STRIPE_SECRET_KEY</code> to enable real Stripe
                    Checkout. For now this simulates a successful payment and clears your cart.
                  </p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Field label="Card number" full>
                    <input className="input font-mono tracking-wider" placeholder="4242 4242 4242 4242" />
                  </Field>
                  <Field label="Expiry">
                    <input className="input" placeholder="MM / YY" />
                  </Field>
                  <Field label="CVC">
                    <input className="input" placeholder="123" />
                  </Field>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                className="btn-outline"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </button>
            ) : (
              <div />
            )}
            {step < 3 ? (
              <button type="button" onClick={next} className="btn-primary">
                Continue <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? "Processing…" : `Pay ${formatEUR(totals.total)}`}
                {!submitting && <CheckCircle2 className="h-4 w-4" />}
              </button>
            )}
          </div>
        </form>

        {/* Summary */}
        <aside className="h-fit lg:sticky lg:top-24">
          <div className="card p-5">
            <h3 className="font-display text-lg font-semibold">Order summary</h3>
            <ul className="mt-4 space-y-3">
              {items.map((i) => {
                const p = PRODUCTS.find((x) => x.id === i.productId)!;
                return (
                  <li key={i.productId} className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                      <Image src={p.images[0]} alt={p.name} fill sizes="48px" className="object-cover" />
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rype-ink px-1 text-[10px] font-semibold text-white">
                        {i.qty}
                      </span>
                    </div>
                    <div className="flex-1 truncate text-sm">
                      <div className="truncate font-medium">{p.name}</div>
                      <div className="text-xs text-rype-mute">{p.unit}</div>
                    </div>
                    <div className="text-sm font-medium">{formatEUR(p.price * i.qty)}</div>
                  </li>
                );
              })}
            </ul>
            <dl className="mt-5 space-y-1 border-t border-rype-line pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-rype-mute">Subtotal</dt>
                <dd>{formatEUR(totals.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-rype-mute">Delivery</dt>
                <dd>{totals.shipping === 0 ? "Free" : formatEUR(totals.shipping)}</dd>
              </div>
              <div className="mt-1 flex justify-between border-t border-rype-line pt-2 text-base font-semibold">
                <dt>Total</dt>
                <dd>{formatEUR(totals.total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  full,
  children,
}: {
  label: string;
  error?: string;
  full?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rype-red">{error}</p>}
    </div>
  );
}
