import { type VariantProps, cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export function cn(...classes: Array<string | undefined | false | null>) {
  return twMerge(classes.filter(Boolean).join(" "));
}

export function formatPercent(value: number, maximumFractionDigits = 1) {
  return `${value.toFixed(maximumFractionDigits)}%`;
}

export const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
  {
    variants: {
      intent: {
        success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
        warning: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
        danger: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
        info: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
        secondary: "bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200",
      },
    },
    defaultVariants: {
      intent: "info",
    },
  },
);

export type BadgeVariants = VariantProps<typeof badgeVariants>;

