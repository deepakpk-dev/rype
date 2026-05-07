import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

const STYLES: Record<OrderStatus, string> = {
  pending: "bg-rype-yellow/25 text-rype-ink",
  processing: "bg-rype-orange/15 text-rype-orange",
  shipped: "bg-rype-leaf/15 text-rype-leafDark",
  delivered: "bg-rype-leaf/20 text-rype-leafDark",
  cancelled: "bg-rype-red/10 text-rype-red",
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        STYLES[status]
      )}
    >
      {status}
    </span>
  );
}
