import { Target, Shield, Zap } from "lucide-react";

const VALUE_CARDS = [
  {
    title: "Intelligence-Driven Hardening",
    helper:
      "Red Team Arsenal provides actionable intelligence on model vulnerabilities, prioritizing hardening efforts where they matter most.",
    icon: Target,
  },
  {
    title: "Anthropic-Proof Defenses",
    helper:
      "Built from the ground up to counter sophisticated attacks inspired by real cyber espionage incidents, not just toy examples.",
    icon: Shield,
  },
  {
    title: "Enterprise-Scale Testing",
    helper:
      "Test across 14+ frontier models against 6 attack vectors simultaneously, generating comprehensive security reports.",
    icon: Zap,
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


