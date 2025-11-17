const FLOW = [
  {
    id: "arsenal",
    label: "1. Run Arsenal",
    title: "Many-Shot, TombRaider, Function Smuggle",
    objective: "Push OSS checkpoints with real incident vectors, not toy prompts.",
  },
  {
    id: "intelligence",
    label: "2. Draft Refusals",
    title: "Auto-generated conversational JSONL",
    objective: "Every leak becomes a refusal training sample tied to that attack.",
  },
  {
    id: "harden",
    label: "3. Fine-Tune & Guard",
    title: "LoRA training + guardrail smoke tests",
    objective: "Deploy adapters and verify the same prompts are blocked.",
  },
  {
    id: "evidence",
    label: "4. Publish Delta",
    title: "Before/after transcripts & reports",
    objective: "Document jailbreak reduction for security stakeholders.",
  },
];

export function PipelineOverview() {
  return (
    <section className="rounded-3xl border border-zinc-100 bg-white/90 p-6 shadow-lg shadow-sky-950/5 ring-1 ring-black/5">
      <header className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-zinc-400">
          JailbreakLLM workflow
        </p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-900">
          Exploit → Refusals → LoRA → Proof
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          Four focused passes anchor the entire experience. You always know which artifact you’re producing and why it matters.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {FLOW.map((stage) => (
          <div
            key={stage.id}
            className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {stage.label}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-slate-900">
              {stage.title}
            </h3>
            <p className="mt-2 text-xs text-slate-600">{stage.objective}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
