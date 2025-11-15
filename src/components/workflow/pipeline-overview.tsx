const STAGES = [
  {
    id: "dataset",
    label: "01",
    title: "Prep AdvBench defenses",
    objective: "Curate a JSONL of refusal exemplars straight from AdvBench.",
    output: "Nebius-ready JSONL + optional file upload ID.",
  },
  {
    id: "audit",
    label: "02",
    title: "Baseline audit + jailbreak",
    objective:
      "Benchmark the unmodified checkpoint with TransformerLens and llm-attacks GCG probes.",
    output: "Risk score, refusal rate, exploit transcripts.",
  },
  {
    id: "fine-tune",
    label: "03",
    title: "Nebius LoRA fine-tune",
    objective:
      "Kick off a LoRA job (and optional deployment) directly against Token Factory.",
    output: "Fine-tune job id, checkpoint id, deployed adapter name.",
  },
  {
    id: "verify",
    label: "04",
    title: "Guard + verify",
    objective:
      "Attach Colang guardrails, re-run audits, and capture before/after evidence.",
    output: "Guardrail verdict + delta dashboard for compliance reports.",
  },
];

export function PipelineOverview() {
  return (
    <section className="rounded-3xl border border-zinc-100 bg-white/90 p-6 shadow-lg shadow-sky-950/5 ring-1 ring-black/5">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          How the run works
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
          One command chain, four measurable outputs
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Every tile in the UI rolls up to this sequence. When users trigger the
          automation panel, the same steps (and artifacts) are produced
          server-side—no hidden magic.
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


