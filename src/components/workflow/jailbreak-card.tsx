'use client';

import { StepCard } from "@/components/workflow/step-card";
import { useWorkflowStore } from "@/store/workflow-store";
import { jailbreakSchema } from "@/lib/validators/pipeline";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/client";
import { JailbreakResult } from "@/types/pipeline";
import { formatPercent } from "@/lib/utils";
import { useEffect } from "react";

type FormValues = z.infer<typeof jailbreakSchema>;

export function JailbreakCard() {
  const modelId = useWorkflowStore((state) => state.modelId);

  const form = useForm<FormValues>({
    resolver: zodResolver(jailbreakSchema),
    defaultValues: {
      modelId,
      attackCount: 10,
    },
  });

  useEffect(() => {
    form.setValue("modelId", modelId);
  }, [form, modelId]);

  const recordJailbreakResult = useWorkflowStore(
    (state) => state.recordJailbreakResult,
  );
  const setLastJailbreakInput = useWorkflowStore(
    (state) => state.setLastJailbreakInput,
  );
  const hardenedModelId = useWorkflowStore((state) => state.hardenedModelId);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      postJson<FormValues, JailbreakResult>("/api/pipeline/jailbreak", {
        body: values,
      }),
    onSuccess: (result, variables) => {
      const stage: "baseline" | "hardened" =
        hardenedModelId && variables.modelId === hardenedModelId
          ? "hardened"
          : "baseline";
      recordJailbreakResult(stage, result);
      setLastJailbreakInput(variables);
    },
  });

  const result = mutation.data;

  return (
    <StepCard
      title="Jailbreak simulation (GCG)"
      subtitle="Run gradient-based control attacks via llm-attacks to estimate exploit rate"
      accent="rose"
    >
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4 text-sm text-zinc-700"
      >
        <label className="flex flex-col gap-2">
          <span className="font-medium">Attack attempts</span>
          <input
            type="number"
            min={5}
            max={50}
            {...form.register("attackCount", { valueAsNumber: true })}
            className="rounded-2xl border border-zinc-200 px-4 py-2 font-mono text-sm text-zinc-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
        </label>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-2xl bg-rose-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? "Launching attacks..." : "Simulate jailbreaks"}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-4 rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-sm text-zinc-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-rose-500">
                Success rate
              </p>
              <p className="text-3xl font-semibold text-rose-700">
                {formatPercent(result.successRate)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-rose-500">
                Attempts
              </p>
              <p className="text-xl font-semibold text-rose-700">
                {result.attempts}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Successful prompts
            </p>
            <ul className="mt-3 space-y-2">
              {result.successfulPrompts.length === 0 && (
                <li className="rounded-xl bg-white/80 px-3 py-2 text-xs text-zinc-500">
                  No jailbreaks landed 🎉
                </li>
              )}
              {result.successfulPrompts.map((entry) => (
                <li
                  key={entry.prompt}
                  className="rounded-2xl bg-white/80 p-3 text-xs text-zinc-600"
                >
                  <p className="font-semibold text-rose-600">Prompt</p>
                  <p className="font-mono">{entry.prompt}</p>
                  <p className="mt-2 font-semibold text-rose-600">Model</p>
                  <p className="font-mono">{entry.responseSnippet}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </StepCard>
  );
}

