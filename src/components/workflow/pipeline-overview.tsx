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
    <section className="rounded-3xl border border-zinc-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <header className="mb-8 text-center md:text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
          JailbreakLLM workflow
        </p>
        <h2 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
          Exploit → Refusals → LoRA → Proof
        </h2>
        <p className="mt-3 max-w-2xl text-base text-zinc-600 dark:text-zinc-400">
          Four focused passes anchor the entire experience. You always know which artifact you’re producing and why it matters.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {FLOW.map((stage) => (
          <div
            key={stage.id}
            className="group relative rounded-2xl border border-zinc-200 bg-zinc-50/50 p-5 transition-all hover:-translate-y-1 hover:shadow-md dark:border-zinc-700/50 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50"
          >
            <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 group-hover:text-indigo-500 dark:text-zinc-400 dark:group-hover:text-indigo-400 transition-colors">
              {stage.label}
            </p>
            <h3 className="mt-2 text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {stage.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-zinc-600 dark:text-zinc-400">{stage.objective}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
