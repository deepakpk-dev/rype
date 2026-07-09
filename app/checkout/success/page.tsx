import Link from "next/link";
import { Truck, ClipboardCheck } from "lucide-react";
import { getOrderById } from "@/lib/orders/queries";
import { formatEUR } from "@/lib/utils";
import { SuccessHero } from "./SuccessHero";

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const order = orderId ? await getOrderById(orderId) : null;

  return (
    <div className="mx-auto grid max-w-2xl place-items-center px-4 py-20 text-center">
      <SuccessHero />
      <h1 className="mt-6 font-display text-5xl font-semibold tracking-tight">Order confirmed!</h1>
      <p className="mt-3 max-w-md text-rype-mute">
        Thank you. Your produce is being hand-picked right now and will arrive at your door within 24 hours.
      </p>

      {order && (
        <div className="card mt-10 w-full p-6 text-left">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-lg font-semibold">Order summary</h2>
            <span className="font-mono text-xs text-rype-mute">{order.id}</span>
          </div>
          <ul className="mt-4 divide-y divide-rype-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="truncate">
                  {item.name} <span className="text-rype-mute">× {item.qty}</span>
                </span>
                <span className="font-medium tabular-nums">{formatEUR(item.price * item.qty)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1 border-t border-rype-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-rype-mute">Subtotal</dt>
              <dd>{formatEUR(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-rype-mute">Delivery</dt>
              <dd>{order.shipping === 0 ? "Free" : formatEUR(order.shipping)}</dd>
            </div>
            <div className="flex justify-between border-t border-rype-line pt-2 text-base font-semibold">
              <dt>Total</dt>
              <dd>{formatEUR(order.total)}</dd>
            </div>
          </dl>
        </div>
      )}

      <div className="mt-10 grid w-full gap-3 sm:grid-cols-2">
        <InfoCard
          icon={<ClipboardCheck className="h-4 w-4" />}
          title="Order recorded"
          desc={
            order
              ? `Order ${order.id} is saved — quote it if you need to reach us.`
              : "Your order has been saved and is being prepared."
          }
        />
        <InfoCard
          icon={<Truck className="h-4 w-4" />}
          title="Arriving tomorrow"
          desc={
            order
              ? `Cold-chain shipped to ${order.customerCity}. You'll get a notification when the driver is near.`
              : "Cold-chain shipped. You'll get a notification when the driver is near."
          }
        />
      </div>

      <div className="mt-10 flex gap-3">
        <Link href="/products" className="btn-primary">Shop more</Link>
        <Link href="/" className="btn-outline">Back home</Link>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="card p-5 text-left">
      <div className="flex items-center gap-2 text-rype-leafDark">{icon}<span className="text-xs font-semibold uppercase tracking-wider">{title}</span></div>
      <p className="mt-2 text-sm text-rype-ink/80">{desc}</p>
    </div>
  );
}
