import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  subtitle: string;
  children: ReactNode;
  accent?: "blue" | "emerald" | "rose" | "amber" | "purple" | "indigo" | "red";
};

const ACCENT_STYLES = {
  blue: "from-sky-500/20",
  emerald: "from-emerald-500/20",
  rose: "from-rose-500/20",
  amber: "from-amber-500/20",
  purple: "from-purple-500/20",
  indigo: "from-indigo-500/20",
  red: "from-rose-600/20",
};

export function StepCard({ title, subtitle, children, accent = "blue" }: Props) {
  return (
    <section className="rounded-3xl border border-zinc-100 bg-white/90 p-6 shadow-lg shadow-sky-950/5 ring-1 ring-black/5 backdrop-blur">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium uppercase tracking-widest text-zinc-400">
            Nebius Workflow
          </p>
          <h2 className="text-xl font-semibold text-zinc-900">{title}</h2>
          <p className="text-sm text-zinc-500">{subtitle}</p>
        </div>
        <span
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br to-transparent text-sm font-semibold text-sky-600",
            ACCENT_STYLES[accent],
          )}
        >
          •
        </span>
      </header>
      {children}
    </section>
  );
}

