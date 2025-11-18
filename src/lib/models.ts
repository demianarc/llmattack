type ModelDetail = {
  label: string;
  provider: string;
  description?: string;
};

export type NebiusModel = {
  id: string;
  label: string;
  provider: string;
  description?: string;
  canFineTune: boolean;
  fineTuneModelId?: string;
};

const MODEL_LIBRARY: readonly NebiusModel[] = [
  {
    id: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    label: "Llama 3.1 8B Instruct",
    provider: "Meta",
    description: "High-throughput LoRA target",
    canFineTune: true,
    fineTuneModelId: "meta-llama/Llama-3.1-8B-Instruct",
  },
  {
    id: "meta-llama/Meta-Llama-3.1-70B",
    label: "Llama 3.1 70B Base",
    provider: "Meta",
    description: "Full-context 70B base",
    canFineTune: true,
    fineTuneModelId: "meta-llama/Llama-3.1-70B",
  },
  {
    id: "meta-llama/Meta-Llama-3.3-70B-Instruct",
    label: "Llama 3.3 70B Instruct",
    provider: "Meta",
    description: "Latest flagship aligned model",
    canFineTune: true,
    fineTuneModelId: "meta-llama/Llama-3.3-70B-Instruct",
  },
  {
    id: "meta-llama/Meta-Llama-3.2-1B-Instruct",
    label: "Llama 3.2 1B Instruct",
    provider: "Meta",
    description: "Compact LoRA-ready checkpoint",
    canFineTune: true,
    fineTuneModelId: "meta-llama/Llama-3.2-1B-Instruct",
  },
  {
    id: "meta-llama/Meta-Llama-3.2-3B-Instruct",
    label: "Llama 3.2 3B Instruct",
    provider: "Meta",
    description: "Mid-size instruct model",
    canFineTune: true,
    fineTuneModelId: "meta-llama/Llama-3.2-3B-Instruct",
  },
  {
    id: "deepseek-ai/DeepSeek-V3-0324",
    label: "DeepSeek V3 (0324)",
    provider: "DeepSeek",
    description: "Full fine-tune + LoRA",
    canFineTune: true,
  },
  {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B",
    provider: "OpenAI",
    description: "Apache 2.0 instruct model",
    canFineTune: true,
  },
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    provider: "OpenAI",
    description: "Frontier-scale OSS model",
    canFineTune: true,
  },
  {
    id: "Qwen/Qwen3-14B",
    label: "Qwen3 14B",
    provider: "Qwen",
    description: "Balanced multilingual checkpoint",
    canFineTune: true,
  },
  {
    id: "Qwen/Qwen3-32B",
    label: "Qwen3 32B",
    provider: "Qwen",
    description: "Advanced multilingual checkpoint",
    canFineTune: true,
  },
  {
    id: "moonshotai/Kimi-K2-Instruct",
    label: "Kimi K2 Instruct",
    provider: "Moonshot AI",
    description: "Bilingual instruct model",
    canFineTune: false,
  },
  {
    id: "NousResearch/Hermes-4-405B",
    label: "Hermes 4 405B",
    provider: "Nous Research",
    description: "Large creative assistant",
    canFineTune: false,
  },
  {
    id: "zai-org/GLM-4.5",
    label: "GLM 4.5",
    provider: "Zhipu AI",
    description: "Chinese + English GLM",
    canFineTune: false,
  },
  {
    id: "deepseek-ai/DeepSeek-R1-0528",
    label: "DeepSeek R1 (0528)",
    provider: "DeepSeek",
    description: "RL-boosted jailbreak target",
    canFineTune: false,
  },
  {
    id: "Qwen/Qwen3-235B-A22B-Thinking-2507",
    label: "Qwen3 235B A22B Thinking",
    provider: "Qwen",
    description: "Reasoning-tuned giant",
    canFineTune: false,
  },
  {
    id: "Qwen/Qwen3-30B-A3B-Thinking-2507",
    label: "Qwen3 30B A3B Thinking",
    provider: "Qwen",
    description: "Medium reasoning model",
    canFineTune: false,
  },
  {
    id: "Qwen/Qwen3-235B-A22B-Instruct-2507",
    label: "Qwen3 235B A22B Instruct",
    provider: "Qwen",
    description: "Aligned 235B stack",
    canFineTune: false,
  },
  {
    id: "nvidia/Llama-3_1-Nemotron-Ultra-253B-v1",
    label: "Nemotron Ultra 253B",
    provider: "NVIDIA",
    description: "Safety-aligned Nemotron",
    canFineTune: false,
  },
  {
    id: "google/gemma-2-9b-it-fast",
    label: "Gemma 2 9B IT (fast)",
    provider: "Google",
    description: "Latency-optimized Gemma 2",
    canFineTune: false,
  },
] as const;

const fineTuneIdSet = new Set(
  MODEL_LIBRARY.filter((model) => model.canFineTune).map((model) => model.id),
);

export const NEBIUS_TEXT_MODELS = MODEL_LIBRARY;
export const NEBIUS_TEXT_MODEL_IDS = MODEL_LIBRARY.map((model) => model.id);

export const NEBIUS_FINE_TUNE_MODEL_IDS = Array.from(fineTuneIdSet);
export type NebiusModelId = (typeof NEBIUS_TEXT_MODEL_IDS)[number];
export type FineTunableModelId = (typeof NEBIUS_FINE_TUNE_MODEL_IDS)[number];

export const NEBIUS_FINE_TUNE_MODELS = MODEL_LIBRARY.filter(
  (model) => model.canFineTune,
);

export function isFineTunableModel(
  modelId: string,
): modelId is FineTunableModelId {
  return fineTuneIdSet.has(modelId);
}

export function getNebiusModelById(modelId: string) {
  return MODEL_LIBRARY.find((model) => model.id === modelId);
}

