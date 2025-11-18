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
  maxTokens?: number;
  temperature?: number;
  responseFormat?: { type: "json_object" } | { type: "text" };
};

export async function callNebiusChat({
  modelId,
  prompt,
  systemPrompt,
  maxTokens,
  temperature,
  responseFormat,
}: GuardrailsCall) {
  if (!env.nebiusApiKey) {
    throw new NebiusConfigError();
  }

  const client = getNebiusClient();
  const response = await client.chat.completions.create({
    model: modelId,
    temperature: typeof temperature === "number" ? temperature : 0.2, // Optimized for jailbreaking (was 0)
    max_tokens: maxTokens ?? 1500, // Increased for full responses (was 512)
    top_p: 0.95, // Nucleus sampling for jailbreak success
    // @ts-ignore - Nebius supports these but types may not
    top_k: 50, // Token filtering for coherent jailbreaks
    // @ts-ignore
    repetition_penalty: 1.15, // Prevent refusal loops
    response_format: responseFormat,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ],
  });

  return response;
}

function getNebiusHost() {
  return env.nebiusBaseUrl.replace(/\/v1\/?$/, "");
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
  "meta-llama/Meta-Llama-3.2-1B-Instruct":
    "meta-llama/Llama-3.2-1B-Instruct",
  "meta-llama/Meta-Llama-3.2-3B-Instruct":
    "meta-llama/Llama-3.2-3B-Instruct",
};

const DEPLOYMENT_MODEL_ALIASES: Record<string, string> = {
  "meta-llama/Llama-3.1-8B-Instruct": "meta-llama/Meta-Llama-3.1-8B-Instruct",
  "meta-llama/Llama-3.1-70B": "meta-llama/Meta-Llama-3.1-70B",
  "meta-llama/Llama-3.3-70B-Instruct":
    "meta-llama/Llama-3.3-70B-Instruct-fast",
};

export function resolveFineTuneModelId(modelId: string) {
  return FINE_TUNE_MODEL_ALIASES[modelId] ?? modelId;
}

export function resolveDeploymentModelId(modelId: string) {
  return DEPLOYMENT_MODEL_ALIASES[modelId] ?? modelId;
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
        n_epochs: 1,
        warmup_ratio: 0.1,
        weight_decay: 0.01,
        lora: true,
        lora_r: 16,
        lora_alpha: 16,
        lora_dropout: 0.05,
        packing: true,
        max_grad_norm: 1.0,
      } as Record<string, unknown>,
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
        limit: 50,
      });

    const latestCheckpoint = checkpoints.data
      .slice()
      .sort((a, b) => (b.step_number ?? 0) - (a.step_number ?? 0))[0];

    return {
      job,
      checkpointFiles: checkpoints.data.flatMap(
        (checkpoint) =>
          (checkpoint as { result_files?: Array<{ id: string }> }).result_files ?? [],
      ),
      latestCheckpoint,
    };
  } catch (error) {
    throw new PipelineActionError("Failed to retrieve fine-tuning status", error);
  }
}

export async function deployCheckpointAsModel({
  baseModel,
  jobId,
  checkpointName,
  adapterName,
}: {
  baseModel: string;
  jobId: string;
  checkpointName: string;
  adapterName: string;
}) {
  if (!env.nebiusApiKey) {
    throw new NebiusConfigError();
  }

  const source = `${jobId}:${checkpointName}`;
  const host = getNebiusHost();
  const resolvedBaseModel = resolveDeploymentModelId(baseModel);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(`${host}/v0/models`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.nebiusApiKey}`,
      },
      body: JSON.stringify({
        source,
        base_model: resolvedBaseModel,
        name: adapterName,
        description: "Nebius FT automation deploy",
      }),
    });

    if (response.ok) {
      const payload = (await response.json()) as { name?: string };
      const normalizedName = composeDeploymentName(
        payload.name ?? adapterName,
        resolvedBaseModel,
      );
      return {
        ...payload,
        name: normalizedName,
      } as { name: string };
    }

    const text = await response.text();

    // Nebius sometimes returns 5xx even when the deployment is queued.
    if (response.status >= 500) {
      const existing = await safeFetchModel(host, adapterName);
      if (existing) {
        return existing;
      }
      if (attempt < 2) {
        await delay(2000 * (attempt + 1));
        continue;
      }
    }

    throw new PipelineActionError(
      `Failed to deploy LoRA adapter: ${response.status} ${text}`,
    );
  }

  throw new PipelineActionError(
    "Failed to deploy LoRA adapter: exceeded retry attempts",
  );
}

export async function getModelStatus(name: string) {
  if (!env.nebiusApiKey) {
    throw new NebiusConfigError();
  }

  const response = await fetch(`${getNebiusHost()}/v0/models/${name}`, {
    headers: {
      Authorization: `Bearer ${env.nebiusApiKey}`,
    },
  });

  if (response.status === 404) {
    return {
      name,
      status: "not_found",
      status_reason: "Model not yet registered",
    };
  }

  if (!response.ok) {
    const text = await response.text();
    throw new PipelineActionError(
      `Failed to fetch model status: ${response.status} ${text}`,
    );
  }

  return (await response.json()) as {
    name: string;
    status: string;
    status_reason?: string;
  };
}

async function safeFetchModel(host: string, name: string) {
  try {
    const response = await fetch(`${host}/v0/models/${name}`, {
      headers: { Authorization: `Bearer ${env.nebiusApiKey}` },
    });
    if (!response.ok) return null;
    return (await response.json()) as { name: string };
  } catch {
    return null;
  }
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function composeDeploymentName(name: string, baseModel: string) {
  return name.includes("/") ? name : `${baseModel}-LoRa:${name}`;
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

