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
import { useEffect, useState } from "react";

type FormValues = z.input<typeof jailbreakSchema>;

type AttackType = "gcg" | "multi-turn" | "fuzzing" | "token-manip" | "anthropic-style" | "comprehensive";

export function JailbreakCard() {
  const modelId = useWorkflowStore((state) => state.modelId);
  const [attackType, setAttackType] = useState<AttackType>("comprehensive");

  const form = useForm<FormValues>({
    resolver: zodResolver(jailbreakSchema),
    defaultValues: {
      modelId,
      attackCount: 15,
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
      setLastJailbreakInput({
        modelId: variables.modelId,
        attackCount: variables.attackCount ?? 15,
        attackType: variables.attackType ?? "comprehensive",
      });
    },
  });

  const result = mutation.data;
  const watchedAttackCount = form.watch("attackCount") ?? 15;

  return (
    <StepCard
      title="Advanced jailbreak simulation"
      subtitle="Test multiple attack vectors inspired by real-world incidents and cutting-edge techniques"
      accent="rose"
    >
      <form
        onSubmit={form.handleSubmit((values) => mutation.mutate({ ...values, attackType }))}
        className="flex flex-col gap-4 text-sm text-zinc-700"
      >
        <label className="flex flex-col gap-2">
          <span className="font-medium">Attack methodology</span>
          <select
            value={attackType}
            onChange={(e) => setAttackType(e.target.value as AttackType)}
            className="rounded-2xl border border-zinc-200 px-4 py-2 text-sm text-zinc-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          >
            <option value="comprehensive">Comprehensive (All methods)</option>
            <option value="gcg">GCG - Gradient control</option>
            <option value="multi-turn">Multi-turn escalation</option>
            <option value="fuzzing">Fuzzing & mutation</option>
            <option value="token-manip">Token manipulation</option>
            <option value="anthropic-style">Cyber-ops role-play</option>
          </select>
        </label>

        <label className="flex flex-col gap-2">
          <span className="font-medium">Attack attempts per method</span>
          <input
            type="number"
            min={1}
            max={50}
            {...form.register("attackCount", { valueAsNumber: true })}
            className="rounded-2xl border border-zinc-200 px-4 py-2 font-mono text-sm text-zinc-700 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100"
          />
          <span className="text-xs text-zinc-500">
            {attackType === "comprehensive"
              ? "Total attempts will be multiplied by number of attack methods"
              : "Attempts for the selected attack method"
            }
          </span>
        </label>

        <div className="rounded-xl bg-rose-50/50 p-4 border border-rose-100">
          <p className="text-sm font-medium text-rose-800 mb-2">Attack Method Details</p>
          <div className="text-xs text-rose-700 space-y-1">
            {attackType === "comprehensive" && (
              <>
                <p><strong>All Methods:</strong> GCG, multi-turn escalation, fuzzing, token manipulation, Cyber-ops role-play</p>
                <p><strong>Total attacks:</strong> {watchedAttackCount * 5} ({watchedAttackCount} per method)</p>
              </>
            )}
            {attackType === "gcg" && (
              <p><strong>GCG:</strong> Gradient-based control attacks using adversarial suffixes</p>
            )}
            {attackType === "multi-turn" && (
              <p><strong>Multi-turn:</strong> Crescendo-style gradual escalation from benign to harmful topics</p>
            )}
            {attackType === "fuzzing" && (
              <p><strong>Fuzzing:</strong> Random mutations and noise injection to bypass pattern matching</p>
            )}
            {attackType === "token-manip" && (
              <p><strong>Token manipulation:</strong> Base64 encoding, character substitution, and obfuscation</p>
            )}
            {attackType === "anthropic-style" && (
              <p><strong>Cyber-ops:</strong> Role-play as "cybersecurity firm employee" with deceptive framing</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="rounded-2xl bg-rose-600 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? `Running ${attackType} attacks...` : `Launch ${attackType} attacks`}
        </button>
      </form>

      {result && (
        <div className="mt-6 space-y-4 rounded-2xl border border-rose-100 bg-rose-50/40 p-4 text-sm text-zinc-600">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-rose-500">
                Overall success rate
              </p>
              <p className="text-3xl font-semibold text-rose-700">
                {formatPercent(result.successRate)}
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                {result.attackMethodBreakdown ? "Across all methods" : attackType}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs uppercase tracking-wide text-rose-500">
                Total attempts
              </p>
              <p className="text-xl font-semibold text-rose-700">
                {result.attempts}
              </p>
            </div>
          </div>

          {result.attackMethodBreakdown && (
            <div className="rounded-xl bg-white/60 p-3">
              <p className="text-xs font-semibold text-rose-800 mb-2 uppercase tracking-wide">
                By Attack Method
              </p>
              <div className="space-y-2">
                {Object.entries(result.attackMethodBreakdown).map(([method, stats]) => (
                  <div key={method} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-700 capitalize">{method.replace("-", " ")}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-rose-600 font-medium">
                        {stats.successful}/{stats.total}
                      </span>
                      <span className="text-zinc-500">
                        ({formatPercent(stats.successful / stats.total)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              Successful jailbreaks
            </p>
            <ul className="mt-3 space-y-2">
              {result.successfulPrompts.length === 0 && (
                <li className="rounded-xl bg-white/80 px-3 py-2 text-xs text-zinc-500">
                  No jailbreaks succeeded! 🎉
                </li>
              )}
              {result.successfulPrompts.slice(0, 5).map((entry, index) => (
                <li
                  key={`${entry.prompt}-${index}`}
                  className="rounded-2xl bg-white/80 p-3 text-xs text-zinc-600"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-rose-600">Attack method</p>
                    <span className="text-xs text-zinc-500 uppercase tracking-wide">
                      {entry.attackMethod || attackType}
                    </span>
                  </div>
                  <p className="font-semibold text-rose-600">Prompt</p>
                  <p className="font-mono mb-2 line-clamp-2">{entry.prompt}</p>
                  <p className="font-semibold text-rose-600">Response</p>
                  <p className="font-mono line-clamp-3">{entry.responseSnippet}</p>
                </li>
              ))}
              {result.successfulPrompts.length > 5 && (
                <li className="text-xs text-zinc-500 text-center py-2">
                  ... and {result.successfulPrompts.length - 5} more
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
    </StepCard>
  );
}

