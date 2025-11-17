const FLOW = [
  {
    id: "arsenal",
    label: "Step 1",
    title: "Run Jailbreak Arsenal",
    objective: "Hammer selected OSS checkpoints with Many-Shot, TombRaider, Function Smuggle, and other incident-grade vectors.",
    output: "Ranked leak list, per-attack success rates, and judge reasoning for every exploit.",
  },
  {
    id: "insights",
    label: "Step 2",
    title: "Generate Intelligence Pack",
    objective: "Convert the winning jailbreaks into high-signal synthetic refusals tailored to the vulnerable model.",
    output: "Conversational JSONL with offense-aligned prompts and grounded refusal language.",
  },
  {
    id: "hardening",
    label: "Step 3",
    title: "Fine-Tune + Guard",
    objective: "Launch LoRA training, deploy the checkpoint, and smoke-test guardrails against the same prompts.",
    output: "Deployed adapter ID, guardrail policy verdicts, and before/after refusal evidence.",
  },
  {
    id: "validation",
    label: "Step 4",
    title: "Publish Security Delta",
    objective: "Re-run the arsenal on the hardened model to measure jailbreak reduction and document compliance.",
    output: "Executive remediation report ready for security leadership and auditors.",
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
          From exploit to remediation in four focused passes
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          No fluff—just a repeatable loop that starts with real jailbreak pressure, ends with hardened adapters, and proves the delta with evidence.
        </p>
      </header>
      <ol className="space-y-6">
        {FLOW.map((stage, index) => (
          <li key={stage.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700">
                {stage.label}
              </span>
              {index < FLOW.length - 1 && (
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


