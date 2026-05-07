import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "leaf",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: "leaf" | "yellow" | "orange" | "red";
}) {
  const tones: Record<string, string> = {
    leaf: "bg-rype-leaf/10 text-rype-leafDark",
    yellow: "bg-rype-yellow/20 text-rype-ink",
    orange: "bg-rype-orange/15 text-rype-orange",
    red: "bg-rype-red/10 text-rype-red",
  };
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wide text-rype-mute">
            {label}
          </div>
          <div className="mt-2 font-display text-3xl font-semibold tracking-tight">
            {value}
          </div>
          {hint && <div className="mt-1 text-xs text-rype-mute">{hint}</div>}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl",
              tones[tone]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  );
}
