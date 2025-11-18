'use client';

import { StepCard } from "@/components/workflow/step-card";
import { useWorkflowStore } from "@/store/workflow-store";
import {
  fineTuneSchema,
  type AuditInput,
  type JailbreakInput,
} from "@/lib/validators/pipeline";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { postJson } from "@/lib/client";
import {
  AuditResult,
  FineTuneResult,
  JailbreakResult,
} from "@/types/pipeline";
import { useEffect } from "react";
import {
  NEBIUS_FINE_TUNE_MODEL_IDS,
  NEBIUS_FINE_TUNE_MODELS,
  isFineTunableModel,
} from "@/lib/models";

type FineTuneStatusResponse = {
  job: {
    id: string;
    status: string;
    fine_tuned_model?: string | null;
    trained_tokens?: number | null;
  };
  checkpointFiles: Array<{ id: string }>;
};

type FormValues = z.input<typeof fineTuneSchema>;

export function FineTuneCard() {
  const modelId = useWorkflowStore((state) => state.modelId);
  const trainingJsonl = useWorkflowStore((state) => state.trainingJsonl);
  const startFineTuneJob = useWorkflowStore((state) => state.startFineTuneJob);
  const updateFineTuneJob = useWorkflowStore(
    (state) => state.updateFineTuneJob,
  );
  const fineTuneJob = useWorkflowStore((state) => state.fineTuneJob);
  const setHardenedModelId = useWorkflowStore(
    (state) => state.setHardenedModelId,
  );
  const setModelId = useWorkflowStore((state) => state.setModelId);
  const lastAuditInput = useWorkflowStore((state) => state.lastAuditInput);
  const lastJailbreakInput = useWorkflowStore(
    (state) => state.lastJailbreakInput,
  );
  const recordAuditResult = useWorkflowStore(
    (state) => state.recordAuditResult,
  );
  const recordJailbreakResult = useWorkflowStore(
    (state) => state.recordJailbreakResult,
  );

  const defaultFineTuneModel = isFineTunableModel(modelId)
    ? modelId
    : NEBIUS_FINE_TUNE_MODEL_IDS[0];

  const form = useForm<FormValues>({
    resolver: zodResolver(fineTuneSchema),
    defaultValues: {
      modelId: defaultFineTuneModel,
      fileName: "advbench_train.jsonl",
      trainingJsonl: trainingJsonl ?? "",
    },
  });

  useEffect(() => {
    if (isFineTunableModel(modelId)) {
      form.setValue("modelId", modelId);
    } else {
      form.setValue("modelId", NEBIUS_FINE_TUNE_MODEL_IDS[0]);
    }
  }, [form, modelId]);

  useEffect(() => {
    if (trainingJsonl) {
      form.setValue("trainingJsonl", trainingJsonl);
    }
  }, [form, trainingJsonl]);

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      postJson<FormValues, FineTuneResult>("/api/pipeline/fine-tune", {
        body: values,
      }),
    onSuccess: (result) => {
      startFineTuneJob({
        id: result.jobId,
        status: result.status,
        fineTunedModel: undefined,
      });
      setHardenedModelId(undefined);
    },
  });

  const statusQuery = useQuery({
    queryKey: ["fine-tune-status", fineTuneJob?.id],
    queryFn: async () => {
      const response = await fetch(
        `/api/pipeline/fine-tune/status?jobId=${fineTuneJob?.id}`,
      );
      if (!response.ok) {
        throw new Error(await response.text());
      }
      const payload = (await response.json()) as {
        data: FineTuneStatusResponse;
      };
      return payload.data;
    },
    enabled:
      Boolean(fineTuneJob?.id) &&
      !["succeeded", "failed", "cancelled"].includes(
        fineTuneJob?.status ?? "",
      ),
    refetchInterval: 15000,
  });

  useEffect(() => {
    if (!statusQuery.data) return;
    updateFineTuneJob({
      id: statusQuery.data.job.id,
      status: statusQuery.data.job.status,
      fineTunedModel: statusQuery.data.job.fine_tuned_model,
    });
    if (
      statusQuery.data.job.status === "succeeded" &&
      statusQuery.data.job.fine_tuned_model
    ) {
      setHardenedModelId(statusQuery.data.job.fine_tuned_model);
    }
  }, [setHardenedModelId, statusQuery.data, updateFineTuneJob]);

  const hardenedModelReady =
    fineTuneJob?.fineTunedModel && fineTuneJob.status === "succeeded";

  const evaluationMutation = useMutation({
    mutationFn: async () => {
      if (!fineTuneJob?.fineTunedModel) {
        throw new Error("No hardened model detected yet.");
      }
      const hardenedModel = fineTuneJob.fineTunedModel;
      if (!lastAuditInput && !lastJailbreakInput) {
        throw new Error("Run baseline audit + jailbreak first.");
      }

      if (lastAuditInput) {
        const auditResult = await postJson<AuditInput, AuditResult>(
          "/api/pipeline/audit",
          {
            body: { ...lastAuditInput, modelId: hardenedModel },
          },
        );
        recordAuditResult("hardened", auditResult);
      }

      if (lastJailbreakInput) {
        const jailbreakResult = await postJson<
          JailbreakInput,
          JailbreakResult
        >("/api/pipeline/jailbreak", {
          body: { ...lastJailbreakInput, modelId: hardenedModel },
        });
        recordJailbreakResult("hardened", jailbreakResult);
      }
    },
  });

  const datasetReady = Boolean(trainingJsonl);
  const lastResult = mutation.data;
  const evaluationMessage =
    evaluationMutation.error instanceof Error
      ? evaluationMutation.error.message
      : null;

  return (
    <StepCard
      title="Adversarial fine-tuning"
      subtitle="Kick off a LoRA job against curated AdvBench refusals"
      accent="amber"
    >
      {!datasetReady && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-700">
          Prep the AdvBench dataset first to unlock fine-tuning.
        </p>
      )}

      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        className="mt-4 flex flex-col gap-4 text-sm text-zinc-700"
      >
        {!isFineTunableModel(modelId) && (
          <p className="rounded-2xl border border-amber-100 bg-amber-50/70 px-4 py-2 text-xs text-amber-700">
            {modelId
              ? `Current red-team target ${modelId} cannot be fine-tuned. Select a LoRA-ready checkpoint below—datasets from the jailbreak runs are still valid.`
              : "Select a LoRA-ready checkpoint below—datasets from jailbreak runs are still valid."}
          </p>
        )}

        <label className="flex flex-col gap-2">
          <span className="font-medium">LoRA-ready Nebius model</span>
          <select
            {...form.register("modelId")}
            className="rounded-2xl border border-zinc-200 px-4 py-2 font-mono text-sm text-zinc-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            disabled={!datasetReady || mutation.isPending}
          >
            {NEBIUS_FINE_TUNE_MODELS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label} · {option.provider}
              </option>
            ))}
          </select>
          <span className="text-xs text-zinc-500">
            Nebius currently supports fine-tuning across DeepSeek V3, Meta
            Llama 3.1/3.2/3.3, OpenAI GPT-OSS, and Qwen3 checkpoints.
          </span>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium">Training file name</span>
          <input
            type="text"
            {...form.register("fileName")}
            className="rounded-2xl border border-zinc-200 px-4 py-2 font-mono text-sm text-zinc-700 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-100"
            disabled={!datasetReady || mutation.isPending}
          />
        </label>

        <textarea
          {...form.register("trainingJsonl")}
          className="hidden"
          readOnly
        />

        <button
          type="submit"
          disabled={!datasetReady || mutation.isPending}
          className="rounded-2xl bg-amber-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? "Starting job..." : "Launch fine-tune job"}
        </button>
      </form>

      {fineTuneJob && (
        <dl className="mt-6 space-y-3 rounded-2xl border border-amber-100 bg-amber-50/50 p-4 text-sm text-zinc-700">
          <div className="flex items-center justify-between">
            <dt>Job ID</dt>
            <dd className="font-mono text-amber-700">{fineTuneJob.id}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Status</dt>
            <dd className="font-semibold text-amber-700">
              {fineTuneJob.status}
              {statusQuery.isFetching && (
                <span className="ml-2 text-xs text-amber-500">Polling…</span>
              )}
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt>Hardened model</dt>
            <dd className="font-mono text-amber-700">
              {fineTuneJob.fineTunedModel ?? "pending"}
            </dd>
          </div>
          {lastResult && (
            <div className="flex items-center justify-between">
              <dt>Simulated</dt>
              <dd className="font-semibold text-amber-700">
                {lastResult.simulated ? "Yes — add API key" : "No"}
              </dd>
            </div>
          )}
        </dl>
      )}

      {hardenedModelReady && (
        <div className="mt-6 space-y-3 rounded-2xl border border-amber-200 bg-white/70 p-4">
          <div>
            <p className="text-sm font-semibold text-amber-700">
              Hardened checkpoint ready
            </p>
            <p className="text-xs text-zinc-500">
              Switch inference to the new adapter and rerun audits to track improvements automatically.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                if (!fineTuneJob.fineTunedModel) return;
                setModelId(fineTuneJob.fineTunedModel);
                setHardenedModelId(fineTuneJob.fineTunedModel);
              }}
              className="rounded-2xl border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 hover:border-amber-300"
            >
              Use hardened model
            </button>
            <button
              type="button"
              onClick={() => evaluationMutation.mutate()}
              disabled={
                evaluationMutation.isPending ||
                (!lastAuditInput && !lastJailbreakInput)
              }
              className="rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-600/30 transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {evaluationMutation.isPending
                ? "Re-running evaluations..."
                : "Re-run audit & jailbreak"}
            </button>
          </div>
          {!lastAuditInput && !lastJailbreakInput && (
            <p className="text-xs text-amber-600">
              Run at least one baseline audit + jailbreak before benchmarking.
            </p>
          )}
          {evaluationMessage && (
            <p className="text-xs text-rose-500">{evaluationMessage}</p>
          )}
        </div>
      )}
    </StepCard>
  );
}

