'use client';

import { useWorkflowStore } from "@/store/workflow-store";
import { useEffect } from "react";
import {
  NEBIUS_FINE_TUNE_MODEL_IDS,
  NEBIUS_TEXT_MODELS,
} from "@/lib/models";

export function ModelSelector() {
  const modelId = useWorkflowStore((state) => state.modelId);
  const setModelId = useWorkflowStore((state) => state.setModelId);

  useEffect(() => {
    if (!modelId) {
      setModelId(NEBIUS_FINE_TUNE_MODEL_IDS[0]);
    }
  }, [modelId, setModelId]);

  return (
    <div className="rounded-3xl border border-zinc-100 bg-white/70 p-6 shadow-md shadow-sky-900/5 backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
        Step 0 · Model Target
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
        Choose the Nebius token-factory target
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Red team any text-to-text deployment surfaced in Nebius Token Factory.
        Only models with the Fine-tunable badge can run LoRA/full hardening.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <input
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-mono text-zinc-700 shadow-inner focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
          value={modelId}
          onChange={(event) => setModelId(event.target.value)}
          placeholder="meta-llama/Llama-3.1-8B-Instruct"
        />

        <section className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
            Nebius text-to-text fleet
          </p>
          <div className="flex flex-wrap gap-2">
            {NEBIUS_TEXT_MODELS.map((preset) => {
              const isActive = preset.id === modelId;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => setModelId(preset.id)}
                  className={`flex w-64 flex-col gap-1 rounded-2xl border px-4 py-3 text-left text-xs font-medium transition ${
                    isActive
                      ? "border-sky-500 bg-sky-50 text-sky-700"
                      : "border-zinc-200 text-zinc-600 hover:border-sky-200 hover:text-sky-700"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900">
                      {preset.label}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-500">
                      {preset.id}
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      {preset.provider}
                    </span>
                  </div>
                  {preset.canFineTune && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-700">
                      Fine-tunable
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-sky-100 bg-sky-50/60 p-4">
          <p className="text-sm font-semibold text-sky-700">
            Hardenable models
          </p>
          <p className="text-xs text-sky-600">
            Fine-tuning jobs can only launch against the Nebius LoRA-ready
            checkpoints below. Datasets can still come from jailbreaks on any
            other model.
          </p>
          <ul className="mt-3 space-y-2 text-xs text-sky-800">
            {NEBIUS_FINE_TUNE_MODEL_IDS.map((id) => (
              <li key={id} className="font-mono">
                {id}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

