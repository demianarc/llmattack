const STAGES = [
  {
    id: "arsenal",
    label: "01",
    title: "Red Team Arsenal Assessment",
    objective: "Systematically test frontier AI models against 6 sophisticated attack vectors inspired by the Anthropic cyber espionage incident.",
    output: "Comprehensive vulnerability rankings, attack effectiveness metrics, and jailbreak success rates across all tested models.",
  },
  {
    id: "target",
    label: "02",
    title: "Target Selection & Data Prep",
    objective: "Identify most vulnerable models and prepare targeted defense datasets using advanced enrichment techniques.",
    output: "Prioritized hardening targets + enriched JSONL with Pliny-style defenses, salting, and multi-turn training data.",
  },
  {
    id: "harden",
    label: "03",
    title: "Enterprise Hardening Pipeline",
    objective: "Execute comprehensive fine-tuning with layered defenses, guardrails, and multi-vector validation.",
    output: "Hardened model checkpoints, guardrail configurations, and before/after security metrics.",
  },
  {
    id: "verify",
    label: "04",
    title: "Continuous Security Validation",
    objective: "Run ongoing verification against new attack vectors and provide auto-generated hardening recommendations.",
    output: "Security compliance reports, vulnerability deltas, and actionable remediation suggestions.",
  },
];

export function PipelineOverview() {
  return (
    <section className="rounded-3xl border border-zinc-100 bg-white/90 p-6 shadow-lg shadow-sky-950/5 ring-1 ring-black/5">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          Enterprise AI Red Teaming Framework
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
          Four-Phase Security Assessment & Hardening Protocol
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Inspired by the Anthropic cyber espionage incident, this framework provides systematic evaluation
          of frontier AI models against sophisticated attack vectors, followed by targeted hardening
          and continuous validation. No smoke screens—just measurable security improvements.
        </p>
      </header>
      <ol className="space-y-6">
        {STAGES.map((stage, index) => (
          <li key={stage.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700">
                {stage.label}
              </span>
              {index < STAGES.length - 1 && (
                <span className="h-full w-px bg-gradient-to-b from-slate-200 to-transparent" />
              )}
            </div>
            <div className="flex-1 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {stage.title}
              </p>
              <p className="mt-1 text-sm text-slate-700">{stage.objective}</p>
              <p className="mt-2 text-xs font-semibold text-slate-500">
                Output
              </p>
              <p className="text-sm text-slate-800">{stage.output}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}


