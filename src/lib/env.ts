import { NEBIUS_FINE_TUNE_MODEL_IDS } from "@/lib/models";

const REQUIRED_ENV = ["NEBIUS_API_KEY"] as const;

const missingEnv = REQUIRED_ENV.filter(
  (key) => !process.env[key] || process.env[key]?.length === 0,
);

export const env = {
  nebiusApiKey: process.env.NEBIUS_API_KEY,
  nebiusBaseUrl:
    process.env.NEBIUS_BASE_URL ?? "https://api.tokenfactory.nebius.com/v1/",
  hfToken: process.env.HF_TOKEN,
  jailbreakJudgeModelId:
    process.env.JAILBREAK_JUDGE_MODEL_ID ?? "openai/gpt-oss-20b",
  isNebiusConfigured: missingEnv.length === 0,
};

export const telemetry = {
  appName: "JailbreakLLM Control Room",
  defaultModel: NEBIUS_FINE_TUNE_MODEL_IDS[0],
};

