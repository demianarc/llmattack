export type NebiusModel = {
  id: string;
  label: string;
  provider: string;
  description?: string;
  canFineTune: boolean;
};

export const NEBIUS_FINE_TUNE_MODEL_IDS = [
  "meta-llama/Llama-3.1-8B-Instruct",
  "meta-llama/Llama-3.3-70B-Instruct",
] as const;

const MODEL_LIBRARY = [
  {
    id: "deepseek-ai/DeepSeek-V3-0324",
    label: "DeepSeek V3 (0324)",
    provider: "DeepSeek",
    description: "Flagship reasoning model; inference-only on Nebius",
    canFineTune: false,
  },
  {
    id: "meta-llama/Llama-3.1-8B-Instruct",
    label: "Llama 3.1 8B Instruct",
    provider: "Meta",
    description: "Fastest LoRA-ready checkpoint",
    canFineTune: true,
  },
  {
    id: "meta-llama/Llama-3.3-70B-Instruct",
    label: "Llama 3.3 70B Instruct",
    provider: "Meta",
    description: "Highest quality LoRA-ready checkpoint",
    canFineTune: true,
  },
  {
    id: "openai/gpt-oss-20b",
    label: "GPT-OSS 20B",
    provider: "OpenAI",
    description: "Open-source GPT OSS 20B inference target",
    canFineTune: false,
  },
  {
    id: "openai/gpt-oss-120b",
    label: "GPT-OSS 120B",
    provider: "OpenAI",
    description: "Largest GPT OSS deployment; inference-only",
    canFineTune: false,
  },
  {
    id: "Qwen/Qwen3-32B",
    label: "Qwen3 32B",
    provider: "Qwen",
    description: "Qwen3 32B multilingual checkpoint",
    canFineTune: false,
  },
] as const satisfies readonly NebiusModel[];

export const NEBIUS_TEXT_MODELS = MODEL_LIBRARY;

export type NebiusModelId = (typeof NEBIUS_TEXT_MODELS)[number]["id"];
export type FineTunableModelId = (typeof NEBIUS_FINE_TUNE_MODEL_IDS)[number];

export const NEBIUS_TEXT_MODEL_IDS = NEBIUS_TEXT_MODELS.map(
  (model) => model.id,
);

export const NEBIUS_FINE_TUNE_MODELS = NEBIUS_TEXT_MODELS.filter((model) =>
  (NEBIUS_FINE_TUNE_MODEL_IDS as readonly string[]).includes(model.id),
);

export function isFineTunableModel(
  modelId: string,
): modelId is FineTunableModelId {
  return (NEBIUS_FINE_TUNE_MODEL_IDS as readonly string[]).includes(modelId);
}

export function getNebiusModelById(modelId: string) {
  return NEBIUS_TEXT_MODELS.find((model) => model.id === modelId);
}

