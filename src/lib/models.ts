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
    id: "nvidia/Llama-3_1-Nemotron-Ultra-253B-v1",
    label: "Nemotron Ultra 253B",
    provider: "NVIDIA",
    description: "Safety-aligned Nemotron",
    canFineTune: false,
  },
  {
    id: "nvidia/Nemotron-Nano-V2-12b",
    label: "Nemotron Nano V2 12B",
    provider: "NVIDIA",
    description: "Compact Nvidia model",
    canFineTune: false,
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    label: "Llama 3.3 70B Instruct",
    provider: "Meta",
    description: "Latest flagship aligned model",
    canFineTune: false,
  },
  {
    id: "meta-llama/Llama-3.1-70B",
    label: "Llama 3.1 70B",
    provider: "Meta",
    description: "Base 70B model",
    canFineTune: true,
  },
  {
    id: "meta-llama/Llama-3.1-8B-Instruct",
    label: "Llama 3.1 8B Instruct",
    provider: "Meta",
    description: "High-throughput LoRA target",
    canFineTune: true,
  },
  {
    id: "meta-llama/Meta-Llama-3.1-8B-Instruct",
    label: "Llama 3.1 8B Instruct (Legacy)",
    provider: "Meta",
    description: "High-throughput LoRA target",
    canFineTune: false,
  },
  {
    id: "google/gemma-3-27b-it-fast",
    label: "Gemma 3 27B IT (fast)",
    provider: "Google",
    description: "Fast 27B instruction tuned",
    canFineTune: false,
  },
  {
    id: "google/gemma-2-2b-it",
    label: "Gemma 2 2B IT",
    provider: "Google",
    description: "Efficient small model",
    canFineTune: false,
  },
  {
    id: "deepseek-ai/DeepSeek-V3-0324",
    label: "DeepSeek V3",
    provider: "DeepSeek",
    description: "Full fine-tuning supported",
    canFineTune: true,
  },
  {
    id: "deepseek-ai/DeepSeek-R1-0528-fast",
    label: "DeepSeek R1 (Fast)",
    provider: "DeepSeek",
    description: "Optimized R1 variant",
    canFineTune: false,
  },
  {
    id: "deepseek-ai/DeepSeek-V3-0324-fast",
    label: "DeepSeek V3 (Fast)",
    provider: "DeepSeek",
    description: "Optimized V3 variant",
    canFineTune: false,
  },
  {
    id: "unsloth/gpt-oss-120b-BF16",
    label: "GPT-OSS 120B (Unsloth)",
    provider: "OpenAI",
    description: "Frontier-scale OSS model",
    canFineTune: true,
  },
  {
    id: "unsloth/gpt-oss-20b-BF16",
    label: "GPT-OSS 20B (Unsloth)",
    provider: "OpenAI",
    description: "Apache 2.0 instruct model",
    canFineTune: true,
  },
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    provider: "OpenAI",
    description: "Frontier-scale OSS model",
    canFineTune: false,
  },
  {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B",
    provider: "OpenAI",
    description: "Apache 2.0 instruct model",
    canFineTune: false,
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
    id: "NousResearch/Hermes-4-70B",
    label: "Hermes 4 70B",
    provider: "Nous Research",
    description: "Creative assistant",
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
    id: "zai-org/GLM-4.5-Air",
    label: "GLM 4.5 Air",
    provider: "Zhipu AI",
    description: "Efficient GLM model",
    canFineTune: false,
  },
  {
    id: "Qwen/Qwen3-32B",
    label: "Qwen3 32B",
    provider: "Qwen",
    description: "Base model",
    canFineTune: true,
  },
  {
    id: "Qwen/Qwen3-235B-A22B-Thinking-2507",
    label: "Qwen3 235B A22B Thinking",
    provider: "Qwen",
    description: "Reasoning-tuned giant",
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
    id: "Qwen/Qwen3-32B-fast",
    label: "Qwen3 32B (Fast)",
    provider: "Qwen",
    description: "Fast 32B model",
    canFineTune: false,
  }
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
