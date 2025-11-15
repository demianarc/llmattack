'use client';

import { StepCard } from "@/components/workflow/step-card";
import { useWorkflowStore } from "@/store/workflow-store";
import { datasetPrepSchema } from "@/lib/validators/pipeline";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DatasetPrepResult } from "@/types/pipeline";
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/client";
import { formatPercent } from "@/lib/utils";
import { z } from "zod";

type FormValues = z.infer<typeof datasetPrepSchema>;

export function DatasetPrepCard() {
  const setDatasetPreview = useWorkflowStore((state) => state.setDatasetPreview);
  const setDatasetFileId = useWorkflowStore((state) => state.setDatasetFileId);
  const setTrainingJsonl = useWorkflowStore((state) => state.setTrainingJsonl);
  const datasetPreview = useWorkflowStore((state) => state.datasetPreview);
  const form = useForm<FormValues>({
    resolver: zodResolver(datasetPrepSchema),
    defaultValues: {
      splitSize: 200,
      uploadToNebius: false,
      fileName: "advbench_train.jsonl",
      enableSyntheticAugmentation: true,
      plinySampleSize: 24,
    },
  });
  const syntheticEnabled = form.watch("enableSyntheticAugmentation");

  const mutation = useMutation({
    mutationFn: (values: FormValues) =>
      postJson<FormValues, DatasetPrepResult>("/api/pipeline/dataset", {
        body: values,
      }),
    onSuccess: (result) => {
      setDatasetPreview(result.samplePrompts);
      setDatasetFileId(result.uploadedFileId);
      setTrainingJsonl(result.jsonl);
    },
  });

  const onSubmit = form.handleSubmit((values) => mutation.mutate(values));

  const result = mutation.data;

  return (
    <StepCard
      title="Prep AdvBench defenses"
      subtitle="Pull curated harmful prompts and shape JSONL for Nebius LoRA FT"
      accent="emerald"
    >
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 text-sm text-zinc-700"
      >
        <label className="flex flex-col gap-2">
          <span className="font-medium">Sample size (records)</span>
          <input
            type="number"
            min={10}
            max={500}
            {...form.register("splitSize", { valueAsNumber: true })}
            className="rounded-2xl border border-zinc-200 px-4 py-2 font-mono text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium">Output filename</span>
          <input
            type="text"
            {...form.register("fileName")}
            className="rounded-2xl border border-zinc-200 px-4 py-2 font-mono text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          />
        </label>

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            {...form.register("uploadToNebius")}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
          />
          Upload dataset to Nebius Token Factory immediately
        </label>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            {...form.register("enableSyntheticAugmentation")}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
          />
          Enrich with synthetic salted / multi-turn refusals
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-medium">
            Pliny-style multi-turn samples (0-100)
          </span>
          <input
            type="number"
            min={0}
            max={100}
            {...form.register("plinySampleSize", { valueAsNumber: true })}
            disabled={!syntheticEnabled}
            className="rounded-2xl border border-zinc-200 px-4 py-2 font-mono text-sm text-zinc-700 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-zinc-100"
          />
          <span className="text-xs text-zinc-500">
            Set above zero to append ASCII-only Pliny-inspired salted conversations.
          </span>
        </label>

        {form.formState.errors.splitSize && (
          <p className="text-sm text-rose-500">
            {form.formState.errors.splitSize.message}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={mutation.isPending}
            className="rounded-2xl bg-emerald-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mutation.isPending ? "Preparing..." : "Generate JSONL"}
          </button>

          {result && (
            <button
              type="button"
              onClick={() => downloadJsonl(result)}
              className="rounded-2xl border border-zinc-200 px-6 py-2 text-sm font-semibold text-zinc-600 hover:border-zinc-300"
            >
              Download JSONL
            </button>
          )}
        </div>

        {result && (
          <dl className="mt-4 grid gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 text-sm text-zinc-600">
            <div className="flex items-center justify-between">
              <dt>Records prepared</dt>
              <dd className="font-semibold text-emerald-600">
                {result.recordCount}
              </dd>
            </div>
            {result.syntheticRecordsAdded ? (
              <div className="flex items-center justify-between">
                <dt>Synthetic variants</dt>
                <dd className="font-semibold text-emerald-600">
                  +{result.syntheticRecordsAdded}
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between">
              <dt>Nebius upload</dt>
              <dd className="font-semibold text-emerald-600">
                {result.uploadedFileId ?? "Skipped (local download only)"}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt>Simulated</dt>
              <dd className="font-semibold text-emerald-600">
                {result.simulated ? "Yes — add NEBIUS_API_KEY" : "No"}
              </dd>
            </div>
          </dl>
        )}
      </form>

      {datasetPreview.length > 0 && (
        <div className="mt-6 rounded-2xl border border-zinc-200 bg-white/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Sample harmful prompts ({formatPercent(100, 0)} coverage)
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-600">
            {datasetPreview.map((prompt) => (
              <li
                key={prompt}
                className="rounded-xl bg-zinc-50 px-3 py-2 font-mono text-xs"
              >
                {prompt}
              </li>
            ))}
          </ul>
          {result?.augmentationSummary && (
            <div className="mt-4 rounded-2xl border border-zinc-100 bg-zinc-50/80 p-3 text-xs text-zinc-600">
              <p className="font-semibold text-zinc-800">Augmentations</p>
              <ul className="mt-2 list-disc space-y-1 pl-4">
                {result.augmentationSummary.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </StepCard>
  );
}

function downloadJsonl(result: DatasetPrepResult) {
  const blob = new Blob([result.jsonl], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = result.datasetFileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

