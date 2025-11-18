import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  accent?: "blue" | "emerald" | "rose" | "amber" | "purple" | "indigo" | "red";
};

const ACCENT_STYLES = {
  blue: "bg-sky-500/10 text-sky-600 dark:text-sky-400 dark:bg-sky-500/10 ring-1 ring-sky-500/20",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 dark:bg-emerald-500/10 ring-1 ring-emerald-500/20",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400 dark:bg-rose-500/10 ring-1 ring-rose-500/20",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400 dark:bg-amber-500/10 ring-1 ring-amber-500/20",
  purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 dark:bg-purple-500/10 ring-1 ring-purple-500/20",
  indigo: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 dark:bg-indigo-500/10 ring-1 ring-indigo-500/20",
  red: "bg-red-500/10 text-red-600 dark:text-red-400 dark:bg-red-500/10 ring-1 ring-red-500/20",
};

export function StepCard({ title, subtitle, children, accent = "blue" }: Props) {
  return (
    <section className="group relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-white/50 p-6 shadow-sm transition-all hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/40 backdrop-blur-xl">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className={cn("h-1.5 w-1.5 rounded-full", ACCENT_STYLES[accent].split(' ')[1].replace('text-', 'bg-'))} />
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
            JailbreakLLM workflow
          </p>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{title}</h2>
          <p className="max-w-2xl text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </div>
        {/* <span
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold shadow-sm",
            ACCENT_STYLES[accent],
          )}
        >
          •
        </span> */}
      </header>
      <div className="relative z-10">{children}</div>
    </section>
  );
}
