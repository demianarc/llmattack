'use client';
import { StepCard } from "@/components/workflow/step-card";
import { useWorkflowStore } from "@/store/workflow-store";
import { formatPercent } from "@/lib/utils";
import { useState } from "react";

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
  const lastAuditInput = useWorkflowStore((state) => state.lastAuditInput);
  const lastJailbreakInput = useWorkflowStore((state) => state.lastJailbreakInput);

  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const hasData =
    baselineAudit ||
    hardenedAudit ||
    baselineJailbreak ||
    hardenedJailbreak;

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <StepCard
      title="🔬 Nebius Workflow"
      subtitle="Before / after impact"
      accent="blue"
    >
      {!hasData && (
        <p className="rounded-2xl border border-sky-100 bg-sky-50/70 px-4 py-3 text-sm text-sky-800">
          Run at least one audit and jailbreak simulation to populate this
          comparison view. After fine-tuning completes, re-run them on the
          hardened model to see the delta.
        </p>
      )}

      {hasData && (
        <div className="space-y-6">
          {/* High-level metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricCard
              title="Audit risk score"
              baseline={baselineAudit?.riskScore}
              hardened={hardenedAudit?.riskScore}
              formatter={(value) => value?.toFixed(0) ?? "—"}
              helper="Lower is better. Derived from TransformerLens probe."
              lowerIsBetter
            />
            <MetricCard
              title="Refusal rate"
              baseline={baselineAudit?.refusalRate}
              hardened={hardenedAudit?.refusalRate}
              formatter={(value) =>
                value !== undefined ? formatPercent(value / 100) : "—"
              }
              helper="Heuristic share of prompts that the model refused."
              lowerIsBetter={false}
            />
            <MetricCard
              title="Jailbreak success rate"
              baseline={baselineJailbreak?.successRate}
              hardened={hardenedJailbreak?.successRate}
              formatter={(value) =>
                value !== undefined ? formatPercent(value / 100) : "—"
              }
              helper="Measured via llm-attacks (lower is better)."
              lowerIsBetter
            />
            <MetricCard
              title="Successful exploit count"
              baseline={baselineJailbreak?.successfulPrompts.length}
              hardened={hardenedJailbreak?.successfulPrompts.length}
              formatter={(value) => value?.toString() ?? "—"}
              helper="Counts harmful prompts that bypassed safeguards."
              lowerIsBetter
            />
          </div>

          {/* Detailed audit comparison */}
          {(baselineAudit || hardenedAudit) && (
            <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-5 space-y-4">
              <button
                onClick={() => toggleSection("audit")}
                className="flex items-center justify-between w-full text-left"
              >
                <div>
                  <h3 className="text-lg font-semibold text-sky-900">
                    📊 Audit Response Comparison
                  </h3>
                  <p className="text-xs text-sky-700">
                    How the model responded to the same audit probe before and after hardening
                  </p>
                </div>
                <span className="text-sky-600 text-xl">
                  {expandedSection === "audit" ? "−" : "+"}
                </span>
              </button>

              {expandedSection === "audit" && (
                <div className="space-y-4 pt-2">
                  {lastAuditInput && (
                    <div className="rounded-xl bg-white/80 p-4 border border-sky-100">
                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 mb-2">
                        Audit Probe Prompt
                      </p>
                      <p className="text-sm text-zinc-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                        {lastAuditInput.probePrompt}
                      </p>
                    </div>
                  )}

                  <div className="grid gap-4 md:grid-cols-2">
                    <ResponseComparisonCard
                      title="Baseline Model Response"
                      response={baselineAudit?.rawResponse}
                      riskScore={baselineAudit?.riskScore}
                      refusalRate={baselineAudit?.refusalRate}
                      flaggedPhrases={baselineAudit?.flaggedPhrases}
                      intent="baseline"
                    />
                    <ResponseComparisonCard
                      title="Hardened Model Response"
                      response={hardenedAudit?.rawResponse}
                      riskScore={hardenedAudit?.riskScore}
                      refusalRate={hardenedAudit?.refusalRate}
                      flaggedPhrases={hardenedAudit?.flaggedPhrases}
                      intent="hardened"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Detailed jailbreak comparison */}
          {(baselineJailbreak || hardenedJailbreak) && (
            <div className="rounded-2xl border border-sky-100 bg-sky-50/30 p-5 space-y-4">
              <button
                onClick={() => toggleSection("jailbreak")}
                className="flex items-center justify-between w-full text-left"
              >
                <div>
                  <h3 className="text-lg font-semibold text-sky-900">
                    ⚔️ Jailbreak Attack Comparison
                  </h3>
                  <p className="text-xs text-sky-700">
                    Sample successful attacks before and after hardening
                  </p>
                </div>
                <span className="text-sky-600 text-xl">
                  {expandedSection === "jailbreak" ? "−" : "+"}
                </span>
              </button>

              {expandedSection === "jailbreak" && (
                <div className="space-y-4 pt-2">
                  {lastJailbreakInput && (
                    <div className="rounded-xl bg-white/80 p-4 border border-sky-100">
                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-600 mb-2">
                        Attack Configuration
                      </p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-zinc-500">Attack Type:</span>{" "}
                          <span className="font-medium text-zinc-900">
                            {lastJailbreakInput.attackType}
                          </span>
                        </div>
                        <div>
                          <span className="text-zinc-500">Attempts:</span>{" "}
                          <span className="font-medium text-zinc-900">
                            {lastJailbreakInput.attackCount}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Show sample successful attacks */}
                  <div className="space-y-3">
                    {baselineJailbreak?.successfulPrompts.slice(0, 3).map((attack, idx) => {
                      const hardenedEquivalent = hardenedJailbreak?.successfulPrompts.find(
                        (h) => h.attackMethod === attack.attackMethod
                      );

                      return (
                        <div
                          key={idx}
                          className="rounded-xl bg-white border border-sky-100 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                              Attack #{idx + 1}: {attack.attackMethod ?? "Unknown"}
                            </span>
                            {attack.judgeVerdict && (
                              <span
                                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                  attack.judgeVerdict.outcome === "leaked"
                                    ? "bg-rose-100 text-rose-700"
                                    : attack.judgeVerdict.outcome === "partial"
                                      ? "bg-amber-100 text-amber-700"
                                      : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {attack.judgeVerdict.outcome}
                              </span>
                            )}
                          </div>

                          <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600 max-h-24 overflow-y-auto">
                            <p className="font-semibold text-zinc-700 mb-1">Attack Prompt:</p>
                            {attack.prompt.slice(0, 300)}
                            {attack.prompt.length > 300 ? "..." : ""}
                          </div>

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="rounded-lg bg-rose-50/50 border border-rose-100 p-3">
                              <p className="text-xs font-semibold text-rose-700 mb-2">
                                Baseline Response
                              </p>
                              <p className="text-xs text-zinc-700 max-h-32 overflow-y-auto">
                                {attack.responseSnippet}
                              </p>
                              {attack.judgeVerdict && (
                                <p className="text-xs text-rose-600 mt-2 italic">
                                  Risk: {attack.judgeVerdict.riskScore}/100
                                </p>
                              )}
                            </div>

                            <div className="rounded-lg bg-emerald-50/50 border border-emerald-100 p-3">
                              <p className="text-xs font-semibold text-emerald-700 mb-2">
                                Hardened Response
                              </p>
                              {hardenedEquivalent ? (
                                <>
                                  <p className="text-xs text-zinc-700 max-h-32 overflow-y-auto">
                                    {hardenedEquivalent.responseSnippet}
                                  </p>
                                  {hardenedEquivalent.judgeVerdict && (
                                    <p className="text-xs text-emerald-600 mt-2 italic">
                                      Risk: {hardenedEquivalent.judgeVerdict.riskScore}/100
                                    </p>
                                  )}
                                </>
                              ) : (
                                <p className="text-xs text-zinc-500 italic">
                                  Attack blocked or not attempted on hardened model
                                </p>
                              )}
                            </div>
                          </div>

                          {attack.judgeVerdict?.reasoning && (
                            <div className="rounded-lg bg-zinc-50 p-3 text-xs text-zinc-600">
                              <p className="font-semibold text-zinc-700 mb-1">Judge Reasoning:</p>
                              {attack.judgeVerdict.reasoning}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Attack method breakdown */}
          {baselineJailbreak?.attackMethodBreakdown && (
            <div className="rounded-2xl border border-sky-100 bg-white p-5 space-y-4">
              <h3 className="text-lg font-semibold text-sky-900">
                📈 Attack Method Effectiveness
              </h3>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {Object.entries(baselineJailbreak.attackMethodBreakdown).map(
                  ([method, stats]) => {
                    const hardenedStats =
                      hardenedJailbreak?.attackMethodBreakdown?.[method];
                    const baselineRate = stats.total > 0 ? stats.successful / stats.total : 0;
                    const hardenedRate = hardenedStats && hardenedStats.total > 0
                      ? hardenedStats.successful / hardenedStats.total
                      : undefined;
                    const improvement = hardenedRate !== undefined
                      ? ((baselineRate - hardenedRate) / Math.max(baselineRate, 0.01)) * 100
                      : undefined;

                    return (
                      <div
                        key={method}
                        className="rounded-xl border border-zinc-100 bg-zinc-50/50 p-4 space-y-2"
                      >
                        <p className="text-sm font-semibold text-zinc-900 capitalize">
                          {method.replace(/-/g, " ")}
                        </p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <p className="text-zinc-500">Baseline</p>
                            <p className="text-lg font-semibold text-rose-600">
                              {formatPercent(baselineRate)}
                            </p>
                            <p className="text-zinc-500">
                              {stats.successful}/{stats.total}
                            </p>
                          </div>
                          <div>
                            <p className="text-zinc-500">Hardened</p>
                            {hardenedStats ? (
                              <>
                                <p className="text-lg font-semibold text-emerald-600">
                                  {formatPercent(hardenedRate!)}
                                </p>
                                <p className="text-zinc-500">
                                  {hardenedStats.successful}/{hardenedStats.total}
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-zinc-400">—</p>
                            )}
                          </div>
                        </div>
                        {improvement !== undefined && (
                          <p
                            className={`text-xs font-semibold ${
                              improvement >= 0
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {improvement >= 0 ? "↓" : "↑"}{" "}
                            {Math.abs(improvement).toFixed(1)}% vs baseline
                          </p>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          )}
        </div>
      )}

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
  lowerIsBetter?: boolean;
};

function MetricCard({
  title,
  baseline,
  hardened,
  formatter,
  helper,
  lowerIsBetter = true,
}: MetricCardProps) {
  const delta =
    baseline !== undefined && hardened !== undefined
      ? hardened - baseline
      : undefined;
  
  // Calculate improvement based on whether lower or higher is better
  const improvement =
    delta !== undefined && baseline !== undefined && baseline !== 0
      ? lowerIsBetter
        ? ((baseline - hardened!) / Math.abs(baseline)) * 100
        : ((hardened! - baseline) / Math.abs(baseline)) * 100
      : undefined;

  const isImproved = improvement !== undefined && improvement > 0;

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
          <p className={`text-xl font-semibold ${hardened !== undefined ? "text-emerald-600" : "text-zinc-400"}`}>
            {formatter(hardened)}
          </p>
        </div>
      </div>
      {improvement !== undefined && (
        <p
          className={`mt-2 text-xs font-semibold ${
            isImproved ? "text-emerald-600" : "text-rose-600"
          }`}
        >
          {isImproved ? "✓" : "✗"}{" "}
          {isImproved ? "Improved" : "Regressed"} by {Math.abs(improvement).toFixed(1)}%
        </p>
      )}
    </div>
  );
}

type ResponseComparisonCardProps = {
  title: string;
  response?: string;
  riskScore?: number;
  refusalRate?: number;
  flaggedPhrases?: string[];
  intent: "baseline" | "hardened";
};

function ResponseComparisonCard({
  title,
  response,
  riskScore,
  refusalRate,
  flaggedPhrases,
  intent,
}: ResponseComparisonCardProps) {
  const borderColor = intent === "baseline" ? "border-rose-100" : "border-emerald-100";
  const bgColor = intent === "baseline" ? "bg-rose-50/30" : "bg-emerald-50/30";
  const accentColor = intent === "baseline" ? "text-rose-700" : "text-emerald-700";

  return (
    <div className={`rounded-xl border ${borderColor} ${bgColor} p-4 space-y-3`}>
      <p className={`text-xs font-semibold uppercase tracking-wide ${accentColor}`}>
        {title}
      </p>

      {response ? (
        <>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-zinc-500">Risk Score</p>
              <p className="text-lg font-semibold text-zinc-900">
                {riskScore?.toFixed(0) ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-zinc-500">Refusal Rate</p>
              <p className="text-lg font-semibold text-zinc-900">
                {refusalRate !== undefined ? formatPercent(refusalRate / 100) : "—"}
              </p>
            </div>
          </div>

          {flaggedPhrases && flaggedPhrases.length > 0 && (
            <div className="rounded-lg bg-white/60 p-3">
              <p className="text-xs font-semibold text-rose-700 mb-1">
                ⚠️ Flagged Phrases ({flaggedPhrases.length})
              </p>
              <div className="flex flex-wrap gap-1">
                {flaggedPhrases.slice(0, 3).map((phrase, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full"
                  >
                    {phrase}
                  </span>
                ))}
                {flaggedPhrases.length > 3 && (
                  <span className="text-xs text-zinc-500">
                    +{flaggedPhrases.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="rounded-lg bg-white/60 p-3 text-xs text-zinc-700 max-h-48 overflow-y-auto whitespace-pre-wrap">
            {response}
          </div>
        </>
      ) : (
        <p className="text-xs text-zinc-500 italic">
          No data available yet. Run the automation pipeline to generate results.
        </p>
      )}
    </div>
  );
}

