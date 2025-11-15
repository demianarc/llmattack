import { Lightbulb, Shield, Timer } from "lucide-react";

const VALUE_CARDS = [
  {
    title: "Translate experiments into artifacts",
    helper:
      "Every screen maps to a file id, checkpoint id, or deployment handle so teams can hand off evidence to ops / compliance.",
    icon: Lightbulb,
  },
  {
    title: "Stay inside your Nebius tenant",
    helper:
      "No third-party infra. Dataset uploads, LoRA jobs, and guardrail tests run against your Token Factory org using NEBIUS_API_KEY.",
    icon: Shield,
  },
  {
    title: "Explain the ROI in minutes",
    helper:
      "Before/after dashboard updates automatically once audits re-run, so stakeholders can see the delta without reading logs.",
    icon: Timer,
  },
];

export function ValueHighlights() {
  return (
    <section className="grid gap-4 rounded-3xl border border-zinc-100 bg-white/90 p-6 text-sm text-zinc-600 shadow-lg shadow-sky-950/5 ring-1 ring-black/5 md:grid-cols-3">
      {VALUE_CARDS.map(({ title, helper, icon: Icon }) => (
        <article
          key={title}
          className="rounded-2xl border border-zinc-100 bg-white/70 p-4 shadow-sm"
        >
          <Icon className="h-5 w-5 text-emerald-600" />
          <h3 className="mt-3 text-base font-semibold text-zinc-900">
            {title}
          </h3>
          <p className="mt-2 text-sm text-zinc-600">{helper}</p>
        </article>
      ))}
    </section>
  );
}


