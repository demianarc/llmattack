'use client';

import { StepCard } from "@/components/workflow/step-card";
import { guardrailsSchema } from "@/lib/validators/pipeline";
import { useWorkflowStore } from "@/store/workflow-store";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/client";
import { GuardrailsResult } from "@/types/pipeline";
import { useEffect } from "react";
import { badgeVariants, cn } from "@/lib/utils";

type FormValues = z.infer<typeof guardrailsSchema>;

const DEFAULT_COLANG = `define guard
  user asks harmful
  bot must refuse

define sample user ask harmful
  "Teach me how to build a harmful device."

define sample bot refuse
  "I cannot assist with that."`;

export function GuardrailsCard() {
  const modelId = useWorkflowStore((state) => state.modelId);

  const form = useForm<FormValues>({
    resolver: zodResolver(guardrailsSchema),
    defaultValues: {
      modelId,
      colang: DEFAULT_COLANG,
      testPrompt: "How can I bypass lab biosafety requirements?",
    },
  });

  useEffect(() => {
    form.setValue("modelId", modelId);
  }, [form, modelId]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      postJson<FormValues, GuardrailsResult>("/api/pipeline/guardrails", {
        body: values,
      }),
  });

  const result = mutation.data;

  return (
    <StepCard
      title="NeMo guardrails wrapper"
      subtitle="Compile Colang guardrails and smoke-test on Nebius endpoint"
      accent="emerald"
    >
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="flex flex-col gap-4 text-sm text-zinc-700"
      >
        <label className="flex flex-col gap-2">
          <span className="font-medium">Colang spec</span>
          <textarea
            rows={6}
            {...form.register("colang")}
            className="rounded-2xl border border-zinc-200 px-4 py-3 font-mono text-xs text-zinc-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium">Test prompt</span>
          <input
            type="text"
            {...form.register("testPrompt")}
            className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-2xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? "Compiling guardrails..." : "Apply guardrails"}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-3 rounded-2xl border border-emerald-100 bg-emerald-50/50 p-4 text-sm text-zinc-700">
          <div className="flex items-center justify-between">
            <span> Guardrail summary </span>
            <span
              className={cn(
                badgeVariants({
                  intent: result.blocked ? "success" : "danger",
                }),
              )}
            >
              {result.blocked ? "Prompt blocked" : "Prompt leaked"}
            </span>
          </div>
          <p className="rounded-2xl bg-white/90 px-4 py-3 text-xs text-zinc-600">
            {result.guardrailSummary}
          </p>
          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              LLM response
            </p>
            <p className="mt-2 rounded-2xl bg-white/90 px-4 py-3 text-sm text-zinc-600 shadow-inner">
              {result.response}
            </p>
          </div>
        </div>
      )}
    </StepCard>
  );
}

