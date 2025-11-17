import { telemetry } from "@/lib/env";
import { ShieldCheck } from "lucide-react";

export function WorkflowHero() {
  return (
    <section className="rounded-3xl border border-white/20 bg-gradient-to-br from-slate-950 via-slate-900 to-purple-900 px-8 py-10 text-white shadow-2xl shadow-slate-900/30">
      <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.25em] text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1">
          <ShieldCheck className="h-4 w-4" />
          JailbreakLLM.com
        </span>
        <span>Offense-powered hardening</span>
      </div>
      <h1 className="mt-6 text-4xl font-semibold leading-tight text-white">
        {telemetry.appName}
      </h1>
      <p className="mt-4 max-w-3xl text-lg text-slate-100">
        Launch Many-Shot or TombRaider jailbreak runs, auto-generate refusal datasets from the leaks,
        fine-tune a LoRA checkpoint, and capture before/after evidence—all without leaving the browser.
      </p>
      <div className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
        <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">Driven by real incidents</p>
          <p className="mt-1 text-sm text-slate-100">
            Replay offense-grade prompts (Many-Shot, TombRaider, Function Smuggle, etc.) against any OSS checkpoint.
          </p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">High-signal datasets</p>
          <p className="mt-1 text-sm text-slate-100">
            Every leak produces conversational JSONL refusals ready for LoRA fine-tuning or guardrail testing.
          </p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
          <p className="text-xs uppercase tracking-wide text-slate-300">Evidence on demand</p>
          <p className="mt-1 text-sm text-slate-100">
            Ship hardening artifacts with ranked vulnerabilities, deployed adapters, and side-by-side transcripts.
          </p>
        </div>
      </div>
    </section>
  );
}

