import { telemetry } from "@/lib/env";
import { ShieldCheck } from "lucide-react";

const valueProps = [
  {
    title: "Offense-informed Defense",
    body: "Replay real jailbreak incidents and generate synthetic refusals tied to each leak.",
  },
  {
    title: "One-Pane Workflow",
    body: "Red team, curate data, fine-tune, and verify guardrails without hopping tools.",
  },
  {
    title: "Evidence-Backed Security",
    body: "Every run ships ranked vulnerabilities, hardened checkpoints, and JSONL artifacts.",
  },
];

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
        JailbreakLLM is the control room for securing open-weight models. Launch automated red-team
        campaigns, turn every leak into high-signal refusal data, fine-tune a LoRA, and prove the delta
        with before/after evidence—all inside one glass pane.
      </p>
      <dl className="mt-6 grid gap-6 text-sm sm:grid-cols-3">
        {valueProps.map((item) => (
          <div key={item.title}>
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              {item.title}
            </dt>
            <dd className="mt-1 text-sm text-slate-100">{item.body}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

