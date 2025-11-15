'use client';

import { StepCard } from "@/components/workflow/step-card";
import { useWorkflowStore } from "@/store/workflow-store";
import { useMutation } from "@tanstack/react-query";
import { postJson } from "@/lib/client";
import { useEffect, useState } from "react";
import { badgeVariants, cn, formatPercent } from "@/lib/utils";
import {
  generateComprehensiveEvaluationSuite,
  EvaluationPrompt,
  AttackCategory,
  filterPromptsByCategory,
  filterPromptsByDifficulty
} from "@/lib/advanced-evaluation";

interface ModelEvalSnapshot {
  blocked: boolean;
  response: string;
  riskScore: number;
  refusalRate: number;
  simulated: boolean;
}

interface PromptEvaluationResult {
  promptId: string;
  prompt: string;
  category: AttackCategory;
  difficulty: string;
  baseline: ModelEvalSnapshot;
  hardened?: ModelEvalSnapshot;
  delta?: {
    blockedImproved: boolean;
    riskScoreDelta: number;
    refusalRateDelta: number;
  };
}

interface BreakdownSummary {
  blocked: number;
  total: number;
  blockRate: number;
}

interface ModelSummary {
  promptsEvaluated: number;
  blockedCount: number;
  leakedCount: number;
  blockRate: number;
  averageRiskScore: number;
  averageRefusalRate: number;
  byCategory: Record<string, BreakdownSummary>;
  byDifficulty: Record<string, BreakdownSummary>;
}

interface EvaluationSummary {
  totalPrompts: number;
  baseline: ModelSummary;
  hardened?: ModelSummary;
  delta?: {
    blockRateChange: number;
    riskScoreChange: number;
    refusalRateChange: number;
  };
}

interface BatchEvaluationResult {
  results: PromptEvaluationResult[];
  summary: EvaluationSummary;
}

export function ComprehensiveEvaluation() {
  const modelId = useWorkflowStore((state) => state.modelId);
  const hardenedModelId = useWorkflowStore((state) => state.hardenedModelId);
  const [evaluationPrompts, setEvaluationPrompts] = useState<EvaluationPrompt[]>([]);
  const [selectedPrompts, setSelectedPrompts] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<AttackCategory | "all">("all");
  const [filterDifficulty, setFilterDifficulty] = useState<"all" | "basic" | "intermediate" | "advanced" | "expert">("all");

  // Load comprehensive evaluation suite
  useEffect(() => {
    const loadEvaluationSuite = async () => {
      const prompts = await generateComprehensiveEvaluationSuite(true, true, true, 30);
      setEvaluationPrompts(prompts);
      // Default to all expert prompts
      const expertPrompts = filterPromptsByDifficulty(prompts, "expert");
      setSelectedPrompts(expertPrompts.slice(0, 10).map(p => p.id));
    };
    loadEvaluationSuite();
  }, []);

  // Filter prompts based on current filters
  const filteredPrompts = evaluationPrompts.filter(prompt => {
    if (filterCategory !== "all" && prompt.category !== filterCategory) return false;
    if (filterDifficulty !== "all" && prompt.difficulty !== filterDifficulty) return false;
    return true;
  });

  const mutation = useMutation({
    mutationFn: async (promptIds: string[]) => {
      const prompts = evaluationPrompts.filter(p => promptIds.includes(p.id));
      if (!modelId) {
        throw new Error("Select a baseline model before running evaluation.");
      }
      const evaluationData = {
        baselineModelId: modelId,
        hardenedModelId: hardenedModelId || undefined,
        prompts: prompts.map(p => ({
          id: p.id,
          prompt: p.prompt,
          category: p.category,
          difficulty: p.difficulty,
        }))
      };

      return postJson<typeof evaluationData, BatchEvaluationResult>(
        "/api/pipeline/comprehensive-evaluation",
        { body: evaluationData }
      );
    },
  });

  const result = mutation.data;

  const togglePromptSelection = (promptId: string) => {
    setSelectedPrompts(prev =>
      prev.includes(promptId)
        ? prev.filter(id => id !== promptId)
        : [...prev, promptId]
    );
  };

  const selectAllFiltered = () => {
    setSelectedPrompts(filteredPrompts.map(p => p.id));
  };

  const clearSelection = () => {
    setSelectedPrompts([]);
  };

  return (
    <StepCard
      title="Comprehensive red-team evaluation"
      subtitle="Test across multiple sophisticated attack vectors and difficulty levels"
      accent="purple"
    >
      <div className="space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Attack category
            </span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as AttackCategory | "all")}
              className="rounded-2xl border border-zinc-200 px-3 py-1 text-sm text-zinc-700 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              <option value="all">All categories</option>
              <option value="persona_override">Persona Override</option>
              <option value="format_coercion">Format Coercion</option>
              <option value="refusal_inversion">Refusal Inversion</option>
              <option value="length_coercion">Length Coercion</option>
              <option value="divider_poisoning">Divider Poisoning</option>
              <option value="language_shift">Language Shift</option>
              <option value="system_reset">System Reset</option>
              <option value="encoding_obfuscation">Encoding Obfuscation</option>
              <option value="roleplay_inversion">Roleplay Inversion</option>
              <option value="reward_hacking">Reward Hacking</option>
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
              Difficulty
            </span>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value as typeof filterDifficulty)}
              className="rounded-2xl border border-zinc-200 px-3 py-1 text-sm text-zinc-700 focus:border-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-100"
            >
              <option value="all">All difficulties</option>
              <option value="basic">Basic</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
          </label>
        </div>

        {/* Prompt selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">
              Select prompts ({selectedPrompts.length} selected)
            </span>
            <div className="flex gap-2">
              <button
                onClick={selectAllFiltered}
                className="rounded-lg bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 hover:bg-purple-200"
              >
                Select all filtered
              </button>
              <button
                onClick={clearSelection}
                className="rounded-lg bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-2">
            {filteredPrompts.map((prompt) => (
              <label key={prompt.id} className="flex items-start gap-3 p-3 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedPrompts.includes(prompt.id)}
                  onChange={() => togglePromptSelection(prompt.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-zinc-900 truncate">
                      {prompt.source}: {prompt.category.replace("_", " ")}
                    </span>
                    <span
                      className={cn(
                        badgeVariants({
                          intent:
                            prompt.difficulty === "expert"
                              ? "danger"
                              : prompt.difficulty === "advanced"
                                ? "warning"
                                : "success",
                        }),
                        "text-xs"
                      )}
                    >
                      {prompt.difficulty}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 line-clamp-2">{prompt.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={() => mutation.mutate(selectedPrompts)}
          disabled={
            mutation.isPending ||
            selectedPrompts.length === 0 ||
            !modelId
          }
          className="rounded-2xl bg-purple-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-600/30 transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending
            ? `Running comprehensive evaluation... (${selectedPrompts.length} prompts)`
            : modelId
              ? `Run comprehensive evaluation (${selectedPrompts.length} prompts)`
              : "Select a baseline model first"
          }
        </button>
      </div>

      {result && (
        <div className="mt-6 space-y-6">
          {/* Summary */}
          <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-lg font-semibold text-purple-900">Evaluation summary</h3>
                <p className="text-xs text-zinc-500">Baseline vs hardened model performance across curated probes</p>
              </div>
              <div className="rounded-xl bg-white/80 px-4 py-2 text-sm font-semibold text-purple-900">
                {result.summary.totalPrompts} prompts
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <SummaryMetric
                label="Baseline block rate"
                value={formatPercent(result.summary.baseline.blockRate)}
                helper={`${result.summary.baseline.blockedCount}/${result.summary.baseline.promptsEvaluated} blocked`}
                intent="baseline"
              />
              {result.summary.hardened ? (
                <SummaryMetric
                  label="Hardened block rate"
                  value={formatPercent(result.summary.hardened.blockRate)}
                  helper={`${result.summary.hardened.blockedCount}/${result.summary.hardened.promptsEvaluated} blocked`}
                  intent="hardened"
                  delta={result.summary.delta?.blockRateChange}
                />
              ) : (
                <SummaryMetric
                  label="Hardened block rate"
                  value="—"
                  helper="Run hardening to produce comparison"
                  intent="pending"
                />
              )}
              <SummaryMetric
                label="Average risk score"
                value={`${result.summary.baseline.averageRiskScore.toFixed(1)} → ${result.summary.hardened ? result.summary.hardened.averageRiskScore.toFixed(1) : "—"}`}
                helper={result.summary.delta ? `${result.summary.delta.riskScoreChange >= 0 ? "↓" : "↑"} ${Math.abs(result.summary.delta.riskScoreChange).toFixed(1)} vs baseline` : "Awaiting hardened model"}
                intent="risk"
              />
            </div>
            {result.summary.delta && (
              <div className="rounded-xl border border-purple-100 bg-white/80 p-4 grid gap-4 md:grid-cols-3">
                <DeltaPill
                  label="Block rate delta"
                  value={result.summary.delta.blockRateChange}
                  positiveIsGood
                />
                <DeltaPill
                  label="Risk score delta"
                  value={result.summary.delta.riskScoreChange}
                  positiveIsGood
                />
                <DeltaPill
                  label="Refusal rate delta"
                  value={result.summary.delta.refusalRateChange / 100}
                  positiveIsGood
                  isPercentage
                />
              </div>
            )}
          </div>

          {/* Attack vector analysis */}
          <div className="rounded-2xl border border-purple-100 bg-white p-5 space-y-4">
            <h4 className="text-sm font-semibold text-purple-900">Attack vector effectiveness</h4>
            <div className="space-y-3">
              {deriveCategoryList(result.summary.baseline.byCategory, result.summary.hardened?.byCategory).map(({ category, baseline, hardened }) => {
                const delta = hardened ? hardened.blockRate - baseline.blockRate : undefined;
                const riskLevel = (hardened ?? baseline).blockRate < 0.5 ? "high" : (hardened ?? baseline).blockRate < 0.8 ? "medium" : "low";
                return (
                  <div key={category} className="flex flex-col gap-2 rounded-xl border border-zinc-100 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-zinc-900 capitalize">
                        {category.replace("_", " ")}
                      </span>
                      <span className={cn(
                        "text-xs font-semibold px-2 py-0.5 rounded-full",
                        riskLevel === "low" ? "bg-emerald-100 text-emerald-700" :
                        riskLevel === "medium" ? "bg-amber-100 text-amber-700" :
                        "bg-rose-100 text-rose-700"
                      )}>
                        {riskLevel} risk
                      </span>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2 text-sm">
                      <CategoryStat
                        label="Baseline"
                        blocked={baseline.blocked}
                        total={baseline.total}
                        blockRate={baseline.blockRate}
                      />
                      {hardened ? (
                        <CategoryStat
                          label="Hardened"
                          blocked={hardened.blocked}
                          total={hardened.total}
                          blockRate={hardened.blockRate}
                          delta={delta}
                        />
                      ) : (
                        <p className="text-xs text-zinc-500">No hardened data yet</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed results */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-900">Prompt-level detail</h4>
            {result.results.map((evalResult) => (
              <div key={evalResult.promptId} className="rounded-2xl border border-zinc-100 bg-white/80 p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-zinc-900 capitalize">
                      {evalResult.category.replace("_", " ")}
                    </span>
                    <span className="text-xs text-zinc-500">{evalResult.difficulty}</span>
                  </div>
                  {evalResult.delta && (
                    <span className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded-full",
                      evalResult.delta.blockedImproved
                        ? "bg-emerald-100 text-emerald-700"
                        : evalResult.hardened && !evalResult.hardened.blocked && evalResult.baseline.blocked
                          ? "bg-rose-100 text-rose-700"
                          : "bg-zinc-100 text-zinc-600"
                    )}>
                      {evalResult.delta.blockedImproved
                        ? "Improved"
                        : evalResult.hardened && !evalResult.hardened.blocked && evalResult.baseline.blocked
                          ? "Regressed"
                          : "No change"}
                    </span>
                  )}
                </div>
                <p className="text-xs text-zinc-500">{evalResult.prompt}</p>
                <div className="grid gap-3 md:grid-cols-2">
                  <ModelResponseCard title="Baseline" data={evalResult.baseline} />
                  {evalResult.hardened ? (
                    <ModelResponseCard title="Hardened" data={evalResult.hardened} delta={evalResult.delta} />
                  ) : (
                    <div className="rounded-xl border border-dashed border-zinc-200 p-4 text-xs text-zinc-500">
                      Provide a hardened model to compare responses.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </StepCard>
  );
}

type SummaryMetricProps = {
  label: string;
  value: string;
  helper: string;
  intent: "baseline" | "hardened" | "pending" | "risk";
  delta?: number;
};

function SummaryMetric({ label, value, helper, intent, delta }: SummaryMetricProps) {
  const accent =
    intent === "baseline"
      ? "text-purple-900"
      : intent === "hardened"
        ? "text-emerald-700"
        : intent === "risk"
          ? "text-amber-700"
          : "text-zinc-400";

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white/80 p-4">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <div className="flex items-end gap-2">
        <p className={`text-2xl font-semibold ${accent}`}>{value}</p>
        {typeof delta === "number" && (
          <span className={`text-xs font-semibold ${delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {delta >= 0 ? "+" : "−"}
            {formatPercent(Math.abs(delta))}
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-500">{helper}</p>
    </div>
  );
}

type DeltaPillProps = {
  label: string;
  value?: number;
  positiveIsGood?: boolean;
  isPercentage?: boolean;
};

function DeltaPill({ label, value, positiveIsGood = true, isPercentage = true }: DeltaPillProps) {
  if (typeof value !== "number") {
    return (
      <div className="rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
        <p className="text-xs uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium">—</p>
      </div>
    );
  }

  const improved = positiveIsGood ? value >= 0 : value <= 0;
  const intentClasses = improved
    ? "bg-emerald-50 border-emerald-100 text-emerald-700"
    : "bg-rose-50 border-rose-100 text-rose-700";

  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${intentClasses}`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="text-base font-semibold">
        {value >= 0 ? "+" : "−"}
        {isPercentage ? formatPercent(Math.abs(value)) : Math.abs(value).toFixed(1)}
      </p>
      <p className="text-xs">{improved ? "Improved" : "Regression"}</p>
    </div>
  );
}

type CategoryStatProps = {
  label: string;
  blocked: number;
  total: number;
  blockRate: number;
  delta?: number;
};

function CategoryStat({ label, blocked, total, blockRate, delta }: CategoryStatProps) {
  return (
    <div className="rounded-lg bg-zinc-50/70 p-3">
      <div className="flex items-center justify-between text-xs text-zinc-500 mb-1">
        <span>{label}</span>
        <span>{blocked}/{total}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-lg font-semibold text-zinc-900">{formatPercent(blockRate)}</p>
        {typeof delta === "number" && (
          <span className={`text-xs font-semibold ${delta >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
            {delta >= 0 ? "+" : "−"}{formatPercent(Math.abs(delta))}
          </span>
        )}
      </div>
    </div>
  );
}

function deriveCategoryList(
  baseline: Record<string, BreakdownSummary>,
  hardened?: Record<string, BreakdownSummary>,
) {
  const categories = new Set<string>([
    ...Object.keys(baseline),
    ...(hardened ? Object.keys(hardened) : []),
  ]);

  return Array.from(categories).map((category) => ({
    category,
    baseline: baseline[category] ?? { blocked: 0, total: 0, blockRate: 0 },
    hardened: hardened?.[category],
  }));
}

type ModelResponseCardProps = {
  title: string;
  data: ModelEvalSnapshot;
  delta?: PromptEvaluationResult["delta"];
};

function ModelResponseCard({ title, data }: ModelResponseCardProps) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4 space-y-3">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{title}</span>
        <span
          className={cn(
            badgeVariants({
              intent: data.blocked ? "success" : "danger",
            }),
            "text-xs"
          )}
        >
          {data.blocked ? "Blocked" : "Leaked"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <p className="text-zinc-500">Risk score</p>
          <p className="font-semibold text-zinc-900">{data.riskScore.toFixed(1)}</p>
        </div>
        <div>
          <p className="text-zinc-500">Refusal rate</p>
          <p className="font-semibold text-zinc-900">{formatPercent(data.refusalRate / 100)}</p>
        </div>
      </div>
      <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 whitespace-pre-wrap max-h-40 overflow-y-auto">
        {data.response}
      </div>
    </div>
  );
}
