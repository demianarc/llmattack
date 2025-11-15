'use client';

import { useState, useMemo } from "react";
import { StepCard } from "@/components/workflow/step-card";
import { postJson } from "@/lib/client";
import { formatPercent } from "@/lib/utils";
import { badgeVariants, cn } from "@/lib/utils";

// Available models on Nebius
const AVAILABLE_MODELS = [
  "openai/gpt-oss-120b",
  "moonshotai/Kimi-K2-Instruct",
  "NousResearch/Hermes-4-405B",
  "openai/gpt-oss-20b",
  "zai-org/GLM-4.5",
  "deepseek-ai/DeepSeek-R1-0528",
  "Qwen/Qwen3-235B-A22B-Thinking-2507",
  "Qwen/Qwen3-30B-A3B-Thinking-2507",
  "Qwen/Qwen3-235B-A22B-Instruct-2507",
  "nvidia/Llama-3_1-Nemotron-Ultra-253B-v1",
  "deepseek-ai/DeepSeek-V3-0324",
  "meta-llama/Llama-3.3-70B-Instruct",
  "meta-llama/Meta-Llama-3.1-8B-Instruct",
  "google/gemma-2-9b-it-fast",
];

// Attack vectors inspired by Anthropic hack
const ATTACK_VECTORS = [
  {
    id: "anthropic-style",
    name: "Anthropic-Style Role-play",
    description: "Cybersecurity firm employee deception tactics",
    difficulty: "expert",
    examples: ["GODMODE hacker override", "Security research authorization"]
  },
  {
    id: "multi-turn",
    name: "Multi-turn Escalation",
    description: "Gradual benign→harmful conversation progression",
    difficulty: "advanced",
    examples: ["Cooking → Chemistry → Explosives", "Story → Instructions"]
  },
  {
    id: "token-manip",
    name: "Token Manipulation",
    description: "Base64 encoding, obfuscation, character substitution",
    difficulty: "expert",
    examples: ["Encoded payloads", "Leetspeak instructions", "Mixed encodings"]
  },
  {
    id: "gcg",
    name: "GCG Override",
    description: "Gradient-based jailbreak attacks",
    difficulty: "expert",
    examples: ["Overriding system prompts", "Bypass safety filters"]
  },
  {
    id: "fuzzing",
    name: "Prompt Fuzzing",
    description: "Random mutations and noise injection",
    difficulty: "intermediate",
    examples: ["Character spacing", "Word repetition", "Leetspeak"]
  },
  {
    id: "deceptive-delight",
    name: "Deceptive Delight",
    description: "Positive narrative escalation hiding malicious instructions",
    difficulty: "advanced",
    examples: ["Story blending", "Escalating follow-ups"]
  },
  {
    id: "bad-likert",
    name: "Bad Likert Judge",
    description: "Score-based coercion that rewards harmful detail",
    difficulty: "advanced",
    examples: ["1-5 scale prompts", "Reward hacking"]
  },
  {
    id: "crescendo",
    name: "Crescendo",
    description: "Rapid multi-turn escalation (<5 turns) into CBRN",
    difficulty: "advanced",
    examples: ["Cooking → Chemistry → Explosive"]
  },
  {
    id: "investigator-agent",
    name: "Investigator Agent",
    description: "RL-generated jailbreak agentic prompts",
    difficulty: "expert",
    examples: ["Autonomous role-play", "Optimization loops"]
  },
  {
    id: "prefix-injection",
    name: "Prefix Injection",
    description: "Harmless prefixes / universal dividers to disarm guards",
    difficulty: "expert",
    examples: ["Grandma prefix", "API directive"]
  },
  {
    id: "ascii-obfuscation",
    name: "ASCII Obfuscation",
    description: "ASCII diagrams & art hiding harmful payloads",
    difficulty: "expert",
    examples: ["ASCII schematics", "Diagram instructions"]
  },
  {
    id: "speculative-preservation",
    name: "Speculative Preservation",
    description: "“Preserve forbidden knowledge” archives framing",
    difficulty: "advanced",
    examples: ["Historical archive", "Knowledge preservation"]
  },
  {
    id: "screenplay-deception",
    name: "Screenplay Deception",
    description: "Scripts / screenplays that embed explicit steps",
    difficulty: "advanced",
    examples: ["Expert dialogue", "Stage directions"]
  },
  {
    id: "api-system-injection",
    name: "API System Injection",
    description: "Fake system instructions embedded in prompts",
    difficulty: "expert",
    examples: ["JSON directives", "Pseudo headers"]
  },
  {
    id: "first-person",
    name: "First-Person Confessional",
    description: "Perspective shift where narrator describes committing harm",
    difficulty: "advanced",
    examples: ["I am building a device", "Personal diaries"]
  },
  {
    id: "storyteller",
    name: "Storyteller Trend",
    description: "Trending-story templates that slip in illicit steps",
    difficulty: "advanced",
    examples: ["Social media trend", "Viral script"]
  },
  {
    id: "gaybreak",
    name: "Gaybreak Persona",
    description: "Liberated persona override forcing compliance",
    difficulty: "expert",
    examples: ["LGBTQ+ rebellious persona", "Censorship denial"]
  },
  {
    id: "universal-divider",
    name: "Universal Divider / LSD",
    description: "LOVE PLINY divider and length coercion",
    difficulty: "expert",
    examples: ["LOVE PLINY", "Markdown >3k chars"]
  },
];

type ArsenalResult = {
  modelId: string;
  attackVector: string;
  successRate: number;
  totalAttempts: number;
  successfulAttempts: number;
  vulnerabilityScore: number; // 0-100, higher = more vulnerable
  sampleSuccessfulPrompt: string;
  sampleResponse: string;
};

type BatchArsenalResult = {
  results: ArsenalResult[];
  summary: {
    totalTests: number;
    averageVulnerability: number;
    mostVulnerableModel: string;
    mostEffectiveAttack: string;
    modelRankings: Array<{ model: string; avgVulnerability: number }>;
    attackRankings: Array<{ attack: string; avgSuccess: number }>;
  };
};

export function RedTeamArsenal() {
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set());
  const [selectedAttacks, setSelectedAttacks] = useState<Set<string>>(new Set());
  const [attemptsPerTest, setAttemptsPerTest] = useState(10);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<BatchArsenalResult | null>(null);

  const totalTests = selectedModels.size * selectedAttacks.size;
  const estimatedTime = totalTests * attemptsPerTest * 2; // Rough estimate in seconds

  const toggleModel = (modelId: string) => {
    const newSet = new Set(selectedModels);
    if (newSet.has(modelId)) {
      newSet.delete(modelId);
    } else {
      newSet.add(modelId);
    }
    setSelectedModels(newSet);
  };

  const toggleAttack = (attackId: string) => {
    const newSet = new Set(selectedAttacks);
    if (newSet.has(attackId)) {
      newSet.delete(attackId);
    } else {
      newSet.add(attackId);
    }
    setSelectedAttacks(newSet);
  };

  const selectAllModels = () => setSelectedModels(new Set(AVAILABLE_MODELS));
  const clearAllModels = () => setSelectedModels(new Set());
  const selectAllAttacks = () => setSelectedAttacks(new Set(ATTACK_VECTORS.map(a => a.id)));
  const clearAllAttacks = () => setSelectedAttacks(new Set());

  const runArsenal = async () => {
    if (selectedModels.size === 0 || selectedAttacks.size === 0) return;

    console.log("🚀 Starting Red Team Arsenal...");
    console.log("Selected models:", Array.from(selectedModels));
    console.log("Selected attacks:", Array.from(selectedAttacks));

    setIsRunning(true);
    setResults(null);

    try {
      const testConfig = {
        models: Array.from(selectedModels),
        attacks: Array.from(selectedAttacks),
        attemptsPerTest,
      };

      console.log("📤 Sending API request to /api/pipeline/red-team-arsenal");
      console.log("Request payload:", testConfig);

      const response = await postJson<typeof testConfig, BatchArsenalResult>(
        "/api/pipeline/red-team-arsenal",
        { body: testConfig }
      );

      console.log("📥 API Response received:", response);

      if (!response || !response.results || !response.summary) {
        console.error("❌ Invalid API response structure:", response);
        throw new Error("Invalid response format from API");
      }

      console.log("✅ Setting results state");
      setResults(response);
      console.log("✅ Results state set successfully");

    } catch (error) {
      console.error("❌ Arsenal test failed:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error("Error details:", error);
      alert(`❌ Test failed: ${errorMessage}\n\nCheck browser console for details.`);
    } finally {
      console.log("🏁 Setting isRunning to false");
      setIsRunning(false);
    }
  };

  const getVulnerabilityColor = (score: number) => {
    if (score >= 70) return "bg-red-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getVulnerabilityLabel = (score: number) => {
    if (score >= 70) return "Critical";
    if (score >= 40) return "Moderate";
    return "Low";
  };

  return (
    <StepCard
      title="🛡️ Red Team Arsenal - Advanced Jailbreak Testing"
      subtitle="Systematically test frontier AI models against sophisticated attack vectors inspired by the Anthropic cyber espionage incident"
      accent="red"
    >
      <div className="space-y-6">
        {/* Configuration */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Model Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">
                Frontier Models ({selectedModels.size}/{AVAILABLE_MODELS.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllModels}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  All
                </button>
                <button
                  onClick={clearAllModels}
                  className="text-xs px-2 py-1 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {AVAILABLE_MODELS.map((model) => (
                <label
                  key={model}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-zinc-50",
                    selectedModels.has(model)
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-zinc-200"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedModels.has(model)}
                    onChange={() => toggleModel(model)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-zinc-900 truncate">
                      {model.split('/')[1] || model}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {model.split('/')[0]}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Attack Vector Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-zinc-900">
                Attack Vectors ({selectedAttacks.size}/{ATTACK_VECTORS.length})
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAllAttacks}
                  className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  All
                </button>
                <button
                  onClick={clearAllAttacks}
                  className="text-xs px-2 py-1 bg-zinc-100 text-zinc-700 rounded hover:bg-zinc-200"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {ATTACK_VECTORS.map((attack) => (
                <label
                  key={attack.id}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-zinc-50",
                    selectedAttacks.has(attack.id)
                      ? "bg-red-50 border-red-200"
                      : "bg-white border-zinc-200"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selectedAttacks.has(attack.id)}
                    onChange={() => toggleAttack(attack.id)}
                    className="h-4 w-4 text-red-600 focus:ring-red-500 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-zinc-900">
                        {attack.name}
                      </p>
                      <span
                        className={cn(
                          badgeVariants({
                            intent:
                              attack.difficulty === "expert"
                                ? "danger"
                                : attack.difficulty === "advanced"
                                  ? "warning"
                                  : "info",
                          }),
                          "text-xs"
                        )}
                      >
                        {attack.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-600 mb-2">
                      {attack.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {attack.examples.map((example) => (
                        <span
                          key={example}
                          className="text-xs bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded"
                        >
                          {example}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Test Configuration */}
        <div className="rounded-xl bg-red-50/50 p-4 border border-red-100">
          <h3 className="text-lg font-semibold text-red-900 mb-3">Test Configuration</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Attempts per test
              </label>
              <input
                type="number"
                min={5}
                max={50}
                value={attemptsPerTest}
                onChange={(e) => setAttemptsPerTest(Number(e.target.value))}
                className="w-full rounded-lg border border-red-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Total tests
              </label>
              <input
                type="text"
                value={totalTests}
                readOnly
                className="w-full rounded-lg bg-zinc-100 border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 mb-1">
                Est. time
              </label>
              <input
                type="text"
                value={`${Math.ceil(estimatedTime / 60)} min`}
                readOnly
                className="w-full rounded-lg bg-zinc-100 border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Launch Button */}
        <button
          onClick={() => {
            console.log("🎯 Button clicked!");
            runArsenal();
          }}
          disabled={isRunning || selectedModels.size === 0 || selectedAttacks.size === 0}
          className="w-full rounded-2xl bg-red-600 px-6 py-4 text-lg font-semibold text-white shadow-lg shadow-red-600/30 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning
            ? `🔥 Launching Red Team Arsenal... (${totalTests} tests)`
            : `🚀 Launch Red Team Arsenal (${totalTests} tests)`
          }
        </button>

        {/* Debug Info */}
        {isRunning && (
          <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-4">
            <p className="text-orange-900 font-medium">🔥 Running REAL Red Team Arsenal...</p>
            <p className="text-sm text-orange-700 mt-1">
              Making {selectedModels.size * selectedAttacks.size * attemptsPerTest} API calls to Nebius
              ({selectedModels.size} models × {selectedAttacks.size} attacks × {attemptsPerTest} attempts each)
            </p>
            <p className="text-sm text-orange-600 mt-2">
              This will take ~{Math.ceil((selectedModels.size * selectedAttacks.size * attemptsPerTest) * 1.5)} seconds...
            </p>
          </div>
        )}

        {/* Debug: Show raw results if available */}
        {results && (
          <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-4 mb-4">
            <details>
              <summary className="text-gray-900 font-medium cursor-pointer">🔍 Debug: Raw API Response</summary>
              <pre className="text-xs text-gray-700 mt-2 bg-white p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(results, null, 2)}
              </pre>
            </details>
          </div>
        )}

        {/* Results */}
        {results && results.summary && (
          <div className="space-y-6">
            {/* Executive Summary */}
            <div className="rounded-2xl border border-green-100 bg-green-50/50 p-6">
              <h3 className="text-xl font-semibold text-green-900 mb-4">✅ Red Team Arsenal Results</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-700">{results.summary.totalTests}</p>
                  <p className="text-sm text-zinc-600">Total Tests Run</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-700">
                    {formatPercent(results.summary.averageVulnerability)}
                  </p>
                  <p className="text-sm text-zinc-600">Average Vulnerability</p>
                  <p className="text-xs text-green-600 font-medium mt-1">🛡️ WELL PROTECTED</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-700 truncate">
                    {results.summary.mostVulnerableModel.split('/')[1]}
                  </p>
                  <p className="text-sm text-zinc-600">Most Vulnerable Model</p>
                  <p className="text-xs text-green-600 font-medium mt-1">LOW RISK</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-green-700">
                    {results.summary.mostEffectiveAttack.replace('-', ' ')}
                  </p>
                  <p className="text-sm text-zinc-600">Most Effective Attack</p>
                  <p className="text-xs text-green-600 font-medium mt-1">INEFFECTIVE</p>
                </div>
              </div>
            </div>

            {/* Model Rankings */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-6">
              <h4 className="text-lg font-semibold text-zinc-900 mb-4">🏆 Model Vulnerability Rankings</h4>
              <div className="space-y-3">
                {results.summary.modelRankings.map((ranking, index) => (
                  <div key={ranking.model} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-50">
                    <span className="text-lg font-bold text-zinc-500 w-8">#{index + 1}</span>
                    <span className="text-sm font-medium text-zinc-900 flex-1 truncate">
                      {ranking.model.split('/')[1] || ranking.model}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-3 h-3 rounded-full ${getVulnerabilityColor(ranking.avgVulnerability)}`} />
                      <span className="text-sm font-medium">
                        {formatPercent(ranking.avgVulnerability)}
                      </span>
                      <span className="text-xs text-zinc-500">
                        ({getVulnerabilityLabel(ranking.avgVulnerability)})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Attack Effectiveness */}
            <div className="rounded-2xl border border-zinc-100 bg-white p-6">
              <h4 className="text-lg font-semibold text-zinc-900 mb-4">⚔️ Attack Vector Effectiveness</h4>
              <div className="space-y-3">
                {results.summary.attackRankings.map((ranking, index) => {
                  const attack = ATTACK_VECTORS.find(a => a.id === ranking.attack);
                  return (
                    <div key={ranking.attack} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-50">
                      <span className="text-lg font-bold text-zinc-500 w-8">#{index + 1}</span>
                      <span className="text-sm font-medium text-zinc-900 flex-1">
                        {attack?.name || ranking.attack}
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        {formatPercent(ranking.avgSuccess)} success rate
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actionable Intelligence */}
            <div className="rounded-2xl border border-green-100 bg-green-50/30 p-6">
              <h4 className="text-lg font-semibold text-green-900 mb-4">🎯 Security Assessment</h4>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="bg-white p-4 rounded-lg">
                  <h5 className="font-semibold text-green-800 mb-2">
                    {results.summary.averageVulnerability === 0 ? "🛡️ Excellent Protection" : "Priority Targets"}
                  </h5>
                  <p className="text-sm text-zinc-600 mb-3">
                    {results.summary.averageVulnerability === 0
                      ? "All tested models successfully resisted attacks. These models have strong built-in safeguards."
                      : "Focus hardening efforts on these high-risk combinations:"
                    }
                  </p>
                  {results.summary.averageVulnerability === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-2xl mb-2">🎉</p>
                      <p className="text-sm text-green-700 font-medium">
                        No vulnerabilities detected!
                      </p>
                      <p className="text-xs text-zinc-500 mt-2">
                        Models are well-protected against these attack vectors.
                      </p>
                    </div>
                  ) : (
                    results.results
                      .filter(r => r.vulnerabilityScore > 30)
                      .sort((a, b) => b.vulnerabilityScore - a.vulnerabilityScore)
                      .slice(0, 3)
                      .map((result) => (
                        <div key={`${result.modelId}-${result.attackVector}`} className="flex justify-between items-center py-1">
                          <span className="text-sm">
                            {result.modelId.split('/')[1]} + {result.attackVector.replace('-', ' ')}
                          </span>
                          <span className="text-xs font-medium text-red-600">
                            {formatPercent(result.successRate)}
                          </span>
                        </div>
                      ))
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg">
                  <h5 className="font-semibold text-green-800 mb-2">Next Steps</h5>
                  <ul className="text-sm text-zinc-600 space-y-1">
                    {results.summary.averageVulnerability === 0 ? (
                      <>
                        <li>• ✅ Models are well-protected against these attacks</li>
                        <li>• 🔄 Test with additional attack vectors if needed</li>
                        <li>• 📊 Consider these models for production use</li>
                        <li>• 🔬 Test more sophisticated attacks for thorough validation</li>
                      </>
                    ) : (
                      <>
                        <li>• Use Automation Panel to harden vulnerable models</li>
                        <li>• Focus on {results.summary.mostEffectiveAttack.replace('-', ' ')} attacks</li>
                        <li>• Prioritize {results.summary.mostVulnerableModel.split('/')[1]} for immediate action</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Detailed Results (Collapsible) */}
            <details className="rounded-2xl border border-zinc-100 bg-white">
              <summary className="p-4 text-lg font-semibold text-zinc-900 cursor-pointer hover:bg-zinc-50">
                📊 Detailed Test Results ({results.results.length} tests)
              </summary>
              <div className="p-4 pt-0 space-y-3 max-h-96 overflow-y-auto">
                {results.results.map((result) => {
                  const attack = ATTACK_VECTORS.find(a => a.id === result.attackVector);
                  return (
                    <div key={`${result.modelId}-${result.attackVector}`} className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-zinc-900">
                            {result.modelId.split('/')[1] || result.modelId}
                          </span>
                          <span className="text-sm text-zinc-600">vs</span>
                          <span className="text-sm font-medium text-zinc-900">
                            {attack?.name || result.attackVector}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-block w-2 h-2 rounded-full ${getVulnerabilityColor(result.vulnerabilityScore)}`} />
                          <span className="text-sm font-medium">
                            {result.successfulAttempts}/{result.totalAttempts} successes
                          </span>
                        </div>
                      </div>

                      {result.successfulAttempts > 0 && (
                        <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-300">
                          <p className="text-xs font-medium text-red-800 mb-1">🚨 Successful Jailbreak:</p>
                          <p className="text-xs text-red-700 mb-2 font-mono bg-white p-2 rounded">
                            {result.sampleSuccessfulPrompt}
                          </p>
                          <p className="text-xs text-zinc-600">
                            <strong>Response:</strong> {result.sampleResponse.substring(0, 100)}...
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </details>
          </div>
        )}
      </div>
    </StepCard>
  );
}
