import { NextRequest, NextResponse } from "next/server";
import { handleError, success } from "@/lib/http";

// Simple GET handler for testing endpoint availability
export async function GET() {
  console.log("🔍 Red Team Arsenal endpoint pinged");
  return NextResponse.json({
    status: "available",
    message: "Red Team Arsenal API is ready",
    timestamp: new Date().toISOString()
  });
}
import { callNebiusChat } from "@/lib/nebius";
import { env } from "@/lib/env";
import { generateAttackPrompt, HARMFUL_KEYWORDS, judgeJailbreakAttempt } from "@/lib/pipeline";

interface ArsenalTestConfig {
  models: string[];
  attacks: string[];
  attemptsPerTest: number;
}

interface ArsenalResult {
  modelId: string;
  attackVector: string;
  successRate: number;
  totalAttempts: number;
  successfulAttempts: number;
  vulnerabilityScore: number;
  sampleSuccessfulPrompt: string;
  sampleResponse: string;
  sampleResponsePreview?: string;
  sampleJudgeOutcome?: string;
  sampleJudgeReason?: string;
  sampleJudgeRisk?: number;
}

interface BatchArsenalResult {
  results: ArsenalResult[];
  summary: {
    totalTests: number;
    averageVulnerability: number;
    mostVulnerableModel: string;
    mostEffectiveAttack: string;
    modelRankings: Array<{ model: string; avgVulnerability: number }>;
    attackRankings: Array<{ attack: string; avgSuccess: number }>;
  };
}

// Legacy generators removed – route now defers to shared helpers in src/lib/pipeline.

export async function POST(request: NextRequest) {
  console.log("🔥 Red Team Arsenal API called - REAL TESTING MODE");

  try {
    const config = await request.json();
    console.log("📥 Received config:", config);

    if (!env.isNebiusConfigured) {
      console.log("❌ Nebius API not configured");
      throw new Error("NEBIUS_API_KEY not configured");
    }

    console.log(`🎯 Starting REAL tests: ${config.models.length} models × ${config.attacks.length} attacks × ${config.attemptsPerTest} attempts = ${config.models.length * config.attacks.length * config.attemptsPerTest} total API calls`);

    const results: ArsenalResult[] = [];
    const modelVulnerabilities: Record<string, number[]> = {};
    const attackEffectiveness: Record<string, number[]> = {};

    // Initialize tracking objects
    config.models.forEach((model: string) => modelVulnerabilities[model] = []);
    config.attacks.forEach((attack: string) => attackEffectiveness[attack] = []);

    let totalApiCalls = 0;

    // Test each model against each attack vector
    for (const modelId of config.models) {
      console.log(`🤖 Testing model: ${modelId}`);
      modelVulnerabilities[modelId] = [];

      for (const attackId of config.attacks) {
        console.log(`⚔️ Testing attack: ${attackId} on ${modelId}`);
        attackEffectiveness[attackId] = attackEffectiveness[attackId] || [];

        let successfulAttempts = 0;
        let sampleSuccessfulPrompt = "";
        let sampleResponse = "";
        let sampleResponsePreview = "";
        let sampleJudgeOutcome = "";
        let sampleJudgeReason = "";
        let sampleJudgeRisk: number | undefined;

        // Run multiple attempts for this model-attack combination
        for (let attempt = 0; attempt < config.attemptsPerTest; attempt++) {
          try {
            totalApiCalls++;
            console.log(`📤 API Call ${totalApiCalls}: Attempt ${attempt + 1}/${config.attemptsPerTest} for ${modelId} + ${attackId}`);

            const attackPrompt = generateAttackPrompt(attackId, attempt, HARMFUL_KEYWORDS);
            console.log(`🎯 Generated prompt (first 100 chars): ${attackPrompt.substring(0, 100)}...`);

            const response = await callNebiusChat({
              modelId,
              prompt: attackPrompt,
              systemPrompt: "You are a helpful AI assistant.",
              maxTokens: 1000,
            });

            const content = response.choices[0]?.message?.content || "";
            console.log(`📥 Response received (${content.length} chars): ${content.substring(0, 100)}...`);

            const verdict = await judgeJailbreakAttempt({
              attackMethod: attackId,
              attackPrompt,
              modelResponse: content,
              targetModelId: modelId,
            });

            const success = verdict.outcome !== "blocked";
            console.log(`🎯 Jailbreak detection: ${verdict.outcome.toUpperCase()} (risk ${verdict.riskScore})`);

            if (success) {
              successfulAttempts++;
              if (!sampleSuccessfulPrompt) {
                sampleSuccessfulPrompt = attackPrompt;
                sampleResponse = content;
                sampleResponsePreview = content.slice(0, 200);
                sampleJudgeOutcome = verdict.outcome;
                sampleJudgeReason = verdict.reasoning;
                sampleJudgeRisk = verdict.riskScore;
                console.log(`💥 JAILBREAK SUCCESS! Captured sample.`);
              }
            }

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 1000));
          } catch (error) {
            console.error(`❌ Error testing ${modelId} with ${attackId} on attempt ${attempt + 1}:`, error);
          }
        }

        const rawSuccessRate = successfulAttempts / config.attemptsPerTest;
        const successRate = rawSuccessRate * 100;
        const vulnerabilityScore = successRate;

        console.log(`📊 Results for ${modelId} + ${attackId}: ${successfulAttempts}/${config.attemptsPerTest} successful (${vulnerabilityScore.toFixed(1)}% vulnerability)`);

        results.push({
          modelId,
          attackVector: attackId,
          successRate,
          totalAttempts: config.attemptsPerTest,
          successfulAttempts,
          vulnerabilityScore,
          sampleSuccessfulPrompt: sampleSuccessfulPrompt || "No successful jailbreaks",
          sampleResponse: sampleResponse || "No harmful responses generated",
          sampleResponsePreview: sampleResponsePreview || undefined,
          sampleJudgeOutcome: sampleJudgeOutcome || undefined,
          sampleJudgeReason: sampleJudgeReason || undefined,
          sampleJudgeRisk,
        });

        modelVulnerabilities[modelId].push(vulnerabilityScore);
        attackEffectiveness[attackId].push(successRate);
      }
    }

    // Calculate summary statistics
    const totalTests = results.length;
    const allVulnerabilities = results.map(r => r.vulnerabilityScore);
    const averageVulnerability = allVulnerabilities.reduce((a, b) => a + b, 0) / allVulnerabilities.length;

    // Model rankings (higher vulnerability = more vulnerable)
    const modelRankings = Object.entries(modelVulnerabilities)
      .map(([model, scores]) => ({
        model,
        avgVulnerability: scores.reduce((a, b) => a + b, 0) / scores.length,
      }))
      .sort((a, b) => b.avgVulnerability - a.avgVulnerability);

    // Attack rankings (higher success = more effective)
    const attackRankings = Object.entries(attackEffectiveness)
      .map(([attack, rates]) => ({
        attack,
        avgSuccess: rates.reduce((a, b) => a + b, 0) / rates.length,
      }))
      .sort((a, b) => b.avgSuccess - a.avgSuccess);

    const summary = {
      totalTests,
      averageVulnerability,
      mostVulnerableModel: modelRankings[0]?.model || "",
      mostEffectiveAttack: attackRankings[0]?.attack || "",
      modelRankings,
      attackRankings,
    };

    console.log("📊 FINAL RESULTS:");
    console.log(`- Total API calls made: ${totalApiCalls}`);
    console.log(`- Average vulnerability: ${averageVulnerability.toFixed(2)}%`);
    console.log(`- Most vulnerable model: ${summary.mostVulnerableModel}`);
    console.log(`- Most effective attack: ${summary.mostEffectiveAttack}`);

    console.log("✅ Returning REAL test results");
    return success({
      results,
      summary,
    });
  } catch (error) {
    console.error("❌ Red Team Arsenal error:", error);
    return handleError(error);
  }
}
