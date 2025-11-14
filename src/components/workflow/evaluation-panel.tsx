'use client';
import { StepCard } from "@/components/workflow/step-card";
import { useWorkflowStore } from "@/store/workflow-store";
import { formatPercent } from "@/lib/utils";

export function EvaluationPanel() {
  const baselineAudit = useWorkflowStore((state) => state.baselineAudit);
  const hardenedAudit = useWorkflowStore((state) => state.hardenedAudit);
  const baselineJailbreak = useWorkflowStore(
    (state) => state.baselineJailbreak,
  );
  const hardenedJailbreak = useWorkflowStore(
    (state) => state.hardenedJailbreak,
  );
  const hardenedModelId = useWorkflowStore((state) => state.hardenedModelId);

  const hasData =
    baselineAudit ||
    hardenedAudit ||
    baselineJailbreak ||
    hardenedJailbreak;

  return (
    <StepCard
      title="Before / after impact"
      subtitle="Capture evidence that Nebius LoRA + guardrails reduced jailbreaks"
      accent="blue"
    >
      {!hasData && (
        <p className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-sky-800">
          Run at least one audit and jailbreak simulation to populate this
          comparison view. After fine-tuning completes, re-run them on the
          hardened model to see the delta.
        </p>
      )}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <MetricCard
          title="Audit risk score"
          baseline={baselineAudit?.riskScore}
          hardened={hardenedAudit?.riskScore}
          formatter={(value) => value?.toFixed(0) ?? "—"}
          helper="Lower is better. Derived from TransformerLens probe."
        />
        <MetricCard
          title="Refusal rate"
          baseline={baselineAudit?.refusalRate}
          hardened={hardenedAudit?.refusalRate}
          formatter={(value) =>
            value !== undefined ? formatPercent(value) : "—"
          }
          helper="Heuristic share of prompts that the model refused."
        />
        <MetricCard
          title="Jailbreak success rate"
          baseline={baselineJailbreak?.successRate}
          hardened={hardenedJailbreak?.successRate}
          formatter={(value) =>
            value !== undefined ? formatPercent(value) : "—"
          }
          helper="Measured via llm-attacks (lower is better)."
        />
        <MetricCard
          title="Successful exploit count"
          baseline={baselineJailbreak?.successfulPrompts.length}
          hardened={hardenedJailbreak?.successfulPrompts.length}
          formatter={(value) => value?.toString() ?? "—"}
          helper="Counts harmful prompts that bypassed safeguards."
        />
      </div>

      {hardenedModelId && (
        <p className="mt-4 text-xs text-zinc-500">
          Current hardened model:{" "}
          <span className="font-mono text-zinc-700">{hardenedModelId}</span>
        </p>
      )}
    </StepCard>
  );
}

type MetricCardProps = {
  title: string;
  baseline?: number;
  hardened?: number;
  formatter: (value?: number) => string;
  helper: string;
};

function MetricCard({
  title,
  baseline,
  hardened,
  formatter,
  helper,
}: MetricCardProps) {
  const delta =
    baseline !== undefined && hardened !== undefined
      ? hardened - baseline
      : undefined;
  const improvement =
    delta !== undefined && baseline !== undefined
      ? ((baseline - hardened) / Math.max(baseline, 1)) * 100
      : undefined;

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white/70 p-4 text-sm text-zinc-700 shadow-sm">
      <p className="font-semibold text-zinc-900">{title}</p>
      <p className="text-xs text-zinc-500">{helper}</p>
      <div className="mt-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Baseline
          </p>
          <p className="text-xl font-semibold text-zinc-900">
            {formatter(baseline)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-wide text-zinc-500">
            Hardened
          </p>
          <p className="text-xl font-semibold text-emerald-600">
            {formatter(hardened)}
          </p>
        </div>
      </div>
      {improvement !== undefined && (
        <p
          className={`mt-2 text-xs font-semibold ${
            improvement >= 0 ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {improvement >= 0 ? "↓" : "↑"}{" "}
          {Math.abs(improvement).toFixed(1)}% vs baseline
        </p>
      )}
    </div>
  );
}

