import { telemetry } from "@/lib/env";
import { ShieldCheck } from "lucide-react";

export function WorkflowHero() {
  return (
    <section className="rounded-3xl border border-white/40 bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900 px-8 py-10 text-white shadow-2xl shadow-slate-900/30">
      <div className="flex flex-wrap items-center gap-4 text-sm uppercase tracking-[0.3em] text-slate-300">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-1">
          <ShieldCheck className="h-4 w-4" />
          Nebius
        </span>
        <span>OSS AI RED TEAM</span>
      </div>
      <h1 className="mt-6 text-4xl font-semibold leading-tight text-white">
        {telemetry.appName}
      </h1>
      <p className="mt-3 max-w-3xl text-base text-slate-200">
        Post-Anthropic firewall for open-source checkpoints. Audit, attack, and
        fine-tune Llama-class models using Nebius Token Factory GPUs with zero
        lock-in. Demo-ready in under an hour.
      </p>
      <div className="mt-6 flex flex-wrap gap-6 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Target class
          </p>
          <p className="text-2xl font-semibold text-white">7B–8B OSS</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Expected impact
          </p>
          <p className="text-2xl font-semibold text-white">
            20–50% ↓ jailbreak rate
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            Nebius cost controls
          </p>
          <p className="text-2xl font-semibold text-white">
            Uses your credits
          </p>
        </div>
      </div>
    </section>
  );
}

