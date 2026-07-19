"use client";

import { ExperimentExposure } from "@/components/growth/ExperimentExposure";
import { FREE_SHIPPING_AT } from "@/lib/cart-math";
import { formatEUR } from "@/lib/utils";

export function FreeShippingProgress({ subtotal }: { subtotal: number }) {
  const remaining = Math.max(0, FREE_SHIPPING_AT - subtotal);
  const progress = Math.round((subtotal / FREE_SHIPPING_AT) * 100);

  return (
    <div className="border-b border-rype-line px-5 py-3 text-sm text-rype-ink">
      <ExperimentExposure experiment="free_shipping_progress_v1" />
      {remaining === 0 ? (
        <p className="font-medium text-rype-leafDark">You unlocked free delivery.</p>
      ) : (
        <div
          role="progressbar"
          aria-label={`${progress}% toward free delivery`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="space-y-2"
        >
          <p>Add {formatEUR(remaining)} for free delivery.</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-rype-ink/5">
            <div
              className="h-full rounded-full bg-rype-leaf"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
