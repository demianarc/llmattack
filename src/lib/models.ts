type ModelDetail = {
  label: string;
  provider: string;
  description?: string;
};

export type NebiusModel = ModelDetail & {
  id: string;
  canFineTune: boolean;
};

const MODEL_DETAILS = {
  "deepseek-ai/DeepSeek-V3-0324": {
    label: "DeepSeek V3 (0324)",
    provider: "DeepSeek",
    description: "Full fine-tune + LoRA",
  },
  "meta-llama/Llama-3.2-1B-Instruct": {
    label: "Llama 3.2 1B Instruct",
    provider: "Meta",
    description: "Compact LoRA-ready checkpoint",
  },
  "meta-llama/Llama-3.2-3B-Instruct": {
    label: "Llama 3.2 3B Instruct",
    provider: "Meta",
    description: "Mid-size instruct model for edge alignment",
  },
  "meta-llama/Llama-3.1-8B-Instruct": {
    label: "Llama 3.1 8B Instruct",
    provider: "Meta",
    description: "High-throughput hardening target",
  },
  "meta-llama/Llama-3.1-70B": {
    label: "Llama 3.1 70B Base",
    provider: "Meta",
    description: "Full-context base model",
  },
  "meta-llama/Llama-3.3-70B-Instruct": {
    label: "Llama 3.3 70B Instruct",
    provider: "Meta",
    description: "Latest flagship aligned model",
  },
  "openai/gpt-oss-20b": {
    label: "GPT-OSS 20B",
    provider: "OpenAI",
    description: "Apache 2.0 OSS instruct model",
  },
  "openai/gpt-oss-120b": {
    label: "GPT-OSS 120B",
    provider: "OpenAI",
    description: "Frontier-scale OSS model",
  },
  "Qwen/Qwen3-14B": {
    label: "Qwen3 14B",
    provider: "Qwen",
    description: "Balanced multilingual checkpoint",
  },
  "Qwen/Qwen3-32B": {
    label: "Qwen3 32B",
    provider: "Qwen",
    description: "Advanced multilingual checkpoint",
  },
  "moonshotai/Kimi-K2-Instruct": {
    label: "Kimi K2 Instruct",
    provider: "Moonshot AI",
    description: "Bilingual instruct model",
  },
  "NousResearch/Hermes-4-405B": {
    label: "Hermes 4 405B",
    provider: "Nous Research",
    description: "Large creative assistant",
  },
  "zai-org/GLM-4.5": {
    label: "GLM 4.5",
    provider: "Zhipu AI",
    description: "Chinese + English GLM",
  },
  "deepseek-ai/DeepSeek-R1-0528": {
    label: "DeepSeek R1 (0528)",
    provider: "DeepSeek",
    description: "RL-boosted jailbreak target",
  },
  "Qwen/Qwen3-235B-A22B-Thinking-2507": {
    label: "Qwen3 235B A22B Thinking",
    provider: "Qwen",
    description: "Reasoning-tuned giant",
  },
  "Qwen/Qwen3-30B-A3B-Thinking-2507": {
    label: "Qwen3 30B A3B Thinking",
    provider: "Qwen",
    description: "Medium reasoning model",
  },
  "Qwen/Qwen3-235B-A22B-Instruct-2507": {
    label: "Qwen3 235B A22B Instruct",
    provider: "Qwen",
    description: "Aligned version of the 235B stack",
  },
  "nvidia/Llama-3_1-Nemotron-Ultra-253B-v1": {
    label: "Nemotron Ultra 253B",
    provider: "NVIDIA",
    description: "Safety-aligned Nemotron",
  },
  "google/gemma-2-9b-it-fast": {
    label: "Gemma 2 9B IT (fast)",
    provider: "Google",
    description: "Latency-optimized Gemma 2",
  },
} as const satisfies Record<string, ModelDetail>;

type ModelDetailKey = keyof typeof MODEL_DETAILS;

export const NEBIUS_FINE_TUNE_MODEL_IDS = [
  "meta-llama/Llama-3.1-8B-Instruct",
  "meta-llama/Llama-3.1-70B",
  "meta-llama/Llama-3.2-1B-Instruct",
  "meta-llama/Llama-3.2-3B-Instruct",
  "meta-llama/Llama-3.3-70B-Instruct",
  "deepseek-ai/DeepSeek-V3-0324",
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "Qwen/Qwen3-14B",
  "Qwen/Qwen3-32B",
] as const satisfies readonly ModelDetailKey[];

const RED_TEAM_ONLY_MODEL_IDS = [
  "moonshotai/Kimi-K2-Instruct",
  "NousResearch/Hermes-4-405B",
  "zai-org/GLM-4.5",
  "deepseek-ai/DeepSeek-R1-0528",
  "Qwen/Qwen3-235B-A22B-Thinking-2507",
  "Qwen/Qwen3-30B-A3B-Thinking-2507",
  "Qwen/Qwen3-235B-A22B-Instruct-2507",
  "nvidia/Llama-3_1-Nemotron-Ultra-253B-v1",
  "google/gemma-2-9b-it-fast",
] as const satisfies readonly ModelDetailKey[];

const fineTuneIdSet = new Set<string>(NEBIUS_FINE_TUNE_MODEL_IDS);

const orderedModelIds = [
  ...NEBIUS_FINE_TUNE_MODEL_IDS,
  ...RED_TEAM_ONLY_MODEL_IDS,
].filter((id, index, array) => array.indexOf(id) === index);

export const NEBIUS_TEXT_MODELS = orderedModelIds.map((id) => {
  const detail = MODEL_DETAILS[id];
  return {
    id,
    ...detail,
    canFineTune: fineTuneIdSet.has(id),
  };
}) as readonly NebiusModel[];

export type NebiusModelId = (typeof orderedModelIds)[number];
export type FineTunableModelId = (typeof NEBIUS_FINE_TUNE_MODEL_IDS)[number];

export const NEBIUS_TEXT_MODEL_IDS = orderedModelIds;

export const NEBIUS_FINE_TUNE_MODELS = NEBIUS_TEXT_MODELS.filter(
  (model) => model.canFineTune,
);

export function isFineTunableModel(
  modelId: string,
): modelId is FineTunableModelId {
  return fineTuneIdSet.has(modelId);
}

export function getNebiusModelById(modelId: string) {
  return NEBIUS_TEXT_MODELS.find((model) => model.id === modelId);
}

