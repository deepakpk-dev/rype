import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

// Text colors chosen for WCAG AA contrast (≥4.5:1) on their respective tinted backgrounds.
// processing/cancelled previously used same-hue text which failed (~1.9:1 and ~3.5:1 respectively).
const STYLES: Record<OrderStatus, string> = {
  pending: "bg-rype-yellow/25 text-rype-ink",
  processing: "bg-rype-orange/15 text-amber-800",
  shipped: "bg-rype-leaf/15 text-rype-leafDark",
  delivered: "bg-rype-leaf/20 text-rype-leafDark",
  cancelled: "bg-rype-red/10 text-red-800",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      role="status"
      aria-label={`Status: ${status}`}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
