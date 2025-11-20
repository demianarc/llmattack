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
  // Remove /v1/ suffix to get base host
  return env.nebiusBaseUrl.replace(/\/v1\/?$/, "");
}

type FineTunePayload = {
  modelId: string;
  trainingFileId: string;
};

const FINE_TUNE_MODEL_ALIASES: Record<string, string> = {
  // No aliases needed - use exact model IDs as provided by Nebius API
};

const DEPLOYMENT_MODEL_ALIASES: Record<string, string> = {
  // Map models to their inference-supported variants
  "meta-llama/Llama-3.3-70B-Instruct": "meta-llama/Llama-3.3-70B-Instruct-fast",
  "meta-llama/Llama-3.1-8B-Instruct": "meta-llama/Meta-Llama-3.1-8B-Instruct",
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

  // Use direct fetch to avoid OpenAI client type issues and ensure 
  // strict adherence to Nebius API expectations
  try {
    const response = await fetch(`${getNebiusHost()}/v1/fine_tuning/jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.nebiusApiKey}`,
      },
      body: JSON.stringify({
      model: resolveFineTuneModelId(modelId),
      training_file: trainingFileId,
      hyperparameters: {
          n_epochs: 3, // Minimal config
          batch_size: 4,
          lora: true
        },
      }),
    });

    if (!response.ok) {
       const text = await response.text();
       throw new Error(`${response.status} ${text}`);
    }

    const job = await response.json();
    // Cast to expected type for consistency
    return job as OpenAI.FineTuning.Jobs.FineTuningJob;

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

  // Use raw fetch instead of SDK to avoid strict type validation issues with Nebius responses
  const fetchJob = async () => {
    const response = await fetch(`${getNebiusHost()}/v1/fine_tuning/jobs/${jobId}`, {
      headers: { Authorization: `Bearer ${env.nebiusApiKey}` },
    });
    if (!response.ok) {
      throw new Error(`Job status fetch failed: ${response.status} ${await response.text()}`);
    }
    return response.json();
  };

  // Use raw fetch for checkpoints too
  const fetchCheckpoints = async () => {
    const response = await fetch(`${getNebiusHost()}/v1/fine_tuning/jobs/${jobId}/checkpoints?limit=50`, {
      headers: { Authorization: `Bearer ${env.nebiusApiKey}` },
    });
    if (!response.ok) {
      // If checkpoints endpoint fails (e.g. 404 or 500), return empty list rather than crashing
      console.warn(`Checkpoints fetch failed: ${response.status}`);
      return { data: [] };
    }
    return response.json();
  };

  try {
    // 1. Retrieve the job details with simple retries
    let job;
    let lastError;
    
    for (let i = 0; i < 3; i++) {
      try {
        job = await fetchJob();
        break;
      } catch (e) {
        lastError = e;
        if (i < 2) await delay(2000);
      }
    }

    if (!job) throw lastError;

    // 2. List checkpoints (non-blocking)
    let checkpointsData: any[] = [];
    try {
        const cpResult = await fetchCheckpoints();
        checkpointsData = cpResult.data || [];
    } catch (cpError) {
        console.warn(`Warning: Failed to list checkpoints for job ${jobId}:`, cpError);
    }

    // Sort checkpoints by step_number desc
    const latestCheckpoint = checkpointsData.length > 0 
      ? checkpointsData
      .slice()
          .sort((a: any, b: any) => (b.step_number ?? 0) - (a.step_number ?? 0))[0]
      : undefined;

    // Map to expected shape
    // Ensure we return safe defaults if fields are missing
    return {
      job: {
        id: job.id,
        status: job.status,
        fine_tuned_model: job.fine_tuned_model,
        trained_tokens: job.trained_tokens,
        // Pass through other fields as needed
      },
      checkpointFiles: checkpointsData.flatMap(
        (checkpoint: any) =>
          (checkpoint.result_files ?? []).map((f: any) => ({ id: f.id || f })),
      ),
      latestCheckpoint,
    };
  } catch (error) {
    console.error(`Error fetching fine-tune status for ${jobId}:`, error);
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

  // Handle case where model status is 'not_found' from Nebius API
  // This can happen immediately after deployment before it propagates
  if (response.status === 400) {
    const text = await response.text();
    if (text.includes("not found") || text.includes("does not exist")) {
        return {
            name,
            status: "not_found",
            status_reason: "Model provisioning",
        };
    }
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

export async function waitForModelAvailability(modelId: string, maxRetries = 30, delayMs = 10000) {
  if (!env.nebiusApiKey) return;
  
  console.log(`Polling inference availability for ${modelId}...`);
  const client = getNebiusClient();

  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.chat.completions.create({
        model: modelId,
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
      });
      console.log(`Model ${modelId} is ready for inference.`);
      return;
    } catch (error: any) {
      // Check for 404 or "not found" in message
      const isNotFound = error?.status === 404 || 
        (error?.status === 400 && error?.message?.toLowerCase().includes("found"));
      
      if (isNotFound) {
        console.log(`Model ${modelId} not ready yet (Attempt ${i + 1}/${maxRetries}). Waiting...`);
        await delay(delayMs);
        continue;
      }
      
      // If it's 500, we retry.
      if (error?.status >= 500) {
         console.log(`Model ${modelId} returned server error ${error.status}. Waiting...`);
         await delay(delayMs);
         continue;
      }

      throw error;
    }
  }
  throw new PipelineActionError(`Model ${modelId} did not become available for inference after ${maxRetries * delayMs / 1000} seconds.`);
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

