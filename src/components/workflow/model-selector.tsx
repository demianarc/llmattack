'use client';

import { useWorkflowStore } from "@/store/workflow-store";
import { useEffect } from "react";

const PRESET_MODELS = [
  "meta-llama/Meta-Llama-3.1-8B-Instruct",
  "meta-llama/Llama-2-7b-hf",
  "mistralai/Mistral-7B-Instruct-v0.3",
];

export function ModelSelector() {
  const modelId = useWorkflowStore((state) => state.modelId);
  const setModelId = useWorkflowStore((state) => state.setModelId);

  useEffect(() => {
    if (!modelId) {
      setModelId(PRESET_MODELS[0]);
    }
  }, [modelId, setModelId]);

  return (
    <div className="rounded-3xl border border-zinc-100 bg-white/70 p-6 shadow-md shadow-sky-900/5 backdrop-blur">
      <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
        Step 0 · Model Target
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-zinc-900">
        Choose the OSS checkpoint to harden
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Supports 7B–8B parameter class models hosted on Hugging Face.
      </p>

      <div className="mt-6 flex flex-col gap-4">
        <input
          className="rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-mono text-zinc-700 shadow-inner focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
          value={modelId}
          onChange={(event) => setModelId(event.target.value)}
          placeholder="meta-llama/Meta-Llama-3.1-8B-Instruct"
        />

        <div className="flex flex-wrap gap-2">
          {PRESET_MODELS.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setModelId(preset)}
              className="rounded-full border border-zinc-200 px-4 py-2 text-xs font-medium text-zinc-600 transition hover:border-sky-200 hover:text-sky-700"
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

