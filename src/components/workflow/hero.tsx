import { telemetry } from "@/lib/env";
import { ShieldCheck } from "lucide-react";

export function WorkflowHero() {
  return (
    <section className="rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 px-8 py-10 text-white shadow-2xl shadow-slate-900/30">
      <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.3em] text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1">
          <ShieldCheck className="h-4 w-4" />
          Nebius Token Factory
        </span>
        <span>Red-team automation</span>
      </div>
      <h1 className="mt-6 text-4xl font-semibold leading-tight text-white">
        {telemetry.appName}
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-100">
        One glass pane for preparing harmful data, baselining risk, launching a
        Nebius LoRA job, and validating the hardened checkpoint with guardrails.
        Every click maps to a concrete artifact: JSONL → FT job → deployed LoRA
        → before/after evidence.
      </p>
      <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Models we target
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-white">
            7B–8B OSS (Llama / Mistral)
          </dd>
          <p className="mt-1 text-xs text-slate-300">
            Hugging Face checkpoints, zero vendor lock-in.
          </p>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Expected impact
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-white">
            ↓ 20–50% jailbreak rate
          </dd>
          <p className="mt-1 text-xs text-slate-300">
            Measured via GCG + TransformerLens probes.
          </p>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-wide text-slate-400">
            Run constraints
          </dt>
          <dd className="mt-1 text-2xl font-semibold text-white">
            Uses your Nebius credits
          </dd>
          <p className="mt-1 text-xs text-slate-300">
            Fine-tune + inference spend is fully observable.
          </p>
        </div>
      </dl>
    </section>
  );
}

