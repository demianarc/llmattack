import { type VariantProps, cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

export function cn(...classes: Array<string | undefined | false | null>) {
  return twMerge(classes.filter(Boolean).join(" "));
}

export function formatPercent(value: number, maximumFractionDigits = 1) {
  // If value is a decimal (e.g. 0.333), convert to percent (33.3%)
  // If it's already a percentage (e.g. 33.3), keep it as is
  // Heuristic: if value is <= 1.0 and not exactly 0 or 1 (unless context implies otherwise), treat as decimal
  // But wait, 1.0 could mean 1% or 100%.
  // Safer approach: Standardization.
  // Looking at usage:
  // - RedTeamArsenal uses raw percentages (0-100)
  // - EvaluationPanel uses decimals (0.0-1.0) for refusal rates, but percentages for others.

  // FIX: Check if value is likely a decimal representation (< 1.0) that should be scaled
  // However, 0.5% is valid.
  // Let's stick to the caller handling the scale, but fixing the specific issue in EvaluationPanel.
  // The user issue is 1/3 showing as 0.3%. This implies the input was 0.333... and formatPercent just appended a %.

  // In EvaluationPanel, baselineRate = stats.successful / stats.total
  // This produces 0.333... for 1/3.
  // We want 33.3%.
  // So we need to multiply by 100 inside the component before calling formatPercent, OR update formatPercent to handle it.
  // Standard practice in this codebase seems mixed.
  // Let's update formatPercent to just format the number it is given, and fix the call site.
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

