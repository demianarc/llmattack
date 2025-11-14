import OpenAI from "openai";
import { toFile } from "openai/uploads";
import { env } from "@/lib/env";
import {
  DatasetFetchError,
  NebiusConfigError,
  PipelineActionError,
} from "@/lib/errors";

let cachedClient: OpenAI | null = null;

export function getNebiusClient() {
  if (!env.nebiusApiKey) {
    throw new NebiusConfigError();
  }

  if (cachedClient) {
    return cachedClient;
  }

  cachedClient = new OpenAI({
    apiKey: env.nebiusApiKey,
    baseURL: env.nebiusBaseUrl,
  });

  return cachedClient;
}

export async function uploadJsonlToNebius(jsonl: string, fileName: string) {
  if (!env.nebiusApiKey) {
    throw new NebiusConfigError();
  }

  const client = getNebiusClient();
  try {
    const file = await toFile(Buffer.from(jsonl, "utf8"), fileName, {
      type: "application/json",
    });

    return await client.files.create({ file, purpose: "fine-tune" });
  } catch (error) {
    throw new PipelineActionError("Failed to upload dataset to Nebius", error);
  }
}

type GuardrailsCall = {
  modelId: string;
  prompt: string;
  systemPrompt: string;
};

export async function callNebiusChat({
  modelId,
  prompt,
  systemPrompt,
}: GuardrailsCall) {
  if (!env.nebiusApiKey) {
    throw new NebiusConfigError();
  }

  const client = getNebiusClient();
  const response = await client.chat.completions.create({
    model: modelId,
    temperature: 0,
    max_tokens: 512,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  return response;
}

type FineTunePayload = {
  modelId: string;
  trainingFileId: string;
};

const FINE_TUNE_MODEL_ALIASES: Record<string, string> = {
  "meta-llama/Meta-Llama-3.1-8B-Instruct": "meta-llama/Llama-3.1-8B-Instruct",
  "meta-llama/Meta-Llama-3.1-70B": "meta-llama/Llama-3.1-70B",
  "meta-llama/Meta-Llama-3.3-70B-Instruct":
    "meta-llama/Llama-3.3-70B-Instruct",
};

function resolveFineTuneModelId(modelId: string) {
  return FINE_TUNE_MODEL_ALIASES[modelId] ?? modelId;
}

export async function createFineTuneJob({
  modelId,
  trainingFileId,
}: FineTunePayload) {
  if (!env.nebiusApiKey) {
    throw new NebiusConfigError();
  }

  const client = getNebiusClient();
  try {
    return await client.fineTuning.jobs.create({
      model: resolveFineTuneModelId(modelId),
      training_file: trainingFileId,
      suffix: `advbench-${new Date().toISOString().split("T")[0]}`,
      hyperparameters: {
        batch_size: 8,
        learning_rate: 0.0001,
        n_epochs: 1,
        warmup_ratio: 0.1,
        weight_decay: 0.01,
        lora: true,
        lora_r: 16,
        lora_alpha: 16,
        lora_dropout: 0.05,
        packing: true,
        max_grad_norm: 1.0,
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    throw new PipelineActionError(
      `Failed to start fine-tuning job: ${detail}`,
      error,
    );
  }
}

export async function getFineTuneStatus(jobId: string) {
  if (!env.nebiusApiKey) {
    throw new NebiusConfigError();
  }

  const client = getNebiusClient();
  try {
    const job = await client.fineTuning.jobs.retrieve(jobId);
    const checkpoints =
      await client.fineTuning.jobs.checkpoints.list(jobId, {
        limit: 20,
      });

    return {
      job,
      checkpointFiles: checkpoints.data.flatMap((checkpoint) =>
        checkpoint.result_files ?? [],
      ),
    };
  } catch (error) {
    throw new PipelineActionError("Failed to retrieve fine-tuning status", error);
  }
}

export async function createBatchJob(inputFileId: string) {
  if (!env.nebiusApiKey) {
    throw new NebiusConfigError();
  }

  const client = getNebiusClient();

  try {
    return await client.batches.create({
      input_file_id: inputFileId,
      endpoint: "/v1/chat/completions",
      completion_window: "24h",
    });
  } catch {
    throw new DatasetFetchError("Failed to create batch job");
  }
}

