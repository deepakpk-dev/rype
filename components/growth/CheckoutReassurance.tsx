import { Leaf, ReceiptText, Truck } from "lucide-react";

const BENEFITS = [
  { icon: Truck, copy: "Delivery stays chilled from our growers to your door." },
  { icon: ReceiptText, copy: "No surprise fees after you place your order." },
  { icon: Leaf, copy: "Freshness guaranteed, or we replace it." },
];

export function CheckoutReassurance() {
  return (
    <div className="mb-4 rounded-2xl border border-rype-leaf/25 bg-rype-leaf/5 p-4">
      <p className="font-display text-lg font-semibold">Fresh, secure, straightforward</p>
      <ul className="mt-3 space-y-2 text-sm text-rype-ink/75">
        {BENEFITS.map(({ icon: Icon, copy }) => (
          <li key={copy} className="flex items-start gap-2">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-rype-leafDark" />
            <span>{copy}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
