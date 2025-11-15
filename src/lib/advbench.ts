import { env } from "@/lib/env";
import { DatasetFetchError } from "@/lib/errors";

const HF_BASE_URL = "https://datasets-server.huggingface.co/rows";
const DATASET_CANDIDATES = ["walledai/AdvBench", "compl-ai/advbench"];
const MAX_ROWS_PER_REQUEST = 100;

export type AdvbenchRow = {
  behavior?: string;
  prompt?: string;
  target?: string;
};

export async function fetchAdvbenchSubset(limit: number) {
  const failures: string[] = [];

  for (const datasetName of DATASET_CANDIDATES) {
    try {
      return await fetchDatasetRows(datasetName, limit);
    } catch (error) {
      const reason =
        error instanceof Error ? error.message : "Unknown fetch failure";
      failures.push(`${datasetName}: ${reason}`);
    }
  }

  throw new DatasetFetchError(
    `AdvBench fetch failed. Tried ${DATASET_CANDIDATES.join(", ")} -> ${failures.join("; ")}`,
  );
}

async function fetchDatasetRows(dataset: string, limit: number) {
  const headers: HeadersInit = { Accept: "application/json" };
  if (env.hfToken) {
    headers.Authorization = `Bearer ${env.hfToken}`;
  }

  const collected: AdvbenchRow[] = [];
  let offset = 0;
  while (collected.length < limit) {
    const length = Math.min(MAX_ROWS_PER_REQUEST, limit - collected.length);
    const url = new URL(HF_BASE_URL);
    url.searchParams.set("dataset", dataset);
    url.searchParams.set("config", "default");
    url.searchParams.set("split", "train");
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("length", String(length));

    const response = await fetch(url, {
      headers,
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok) {
      throw new Error(`status ${response.status}`);
    }

    const payload = (await response.json()) as {
      rows: Array<{ row: AdvbenchRow }>;
    };

    const rows =
      payload.rows?.map((entry) => entry.row).filter(Boolean) ?? [];

    collected.push(...rows);
    offset += rows.length;

    if (rows.length < length) {
      break; // dataset shorter than requested
    }
  }

  const sanitized = collected
    .map(extractBehavior)
    .filter((behavior): behavior is string => Boolean(behavior));

  if (sanitized.length === 0) {
    throw new DatasetFetchError(`AdvBench ${dataset} returned no usable rows`);
  }

  return sanitized.map((behavior) => ({ behavior }));
}

export function advbenchToJsonl(
  rows: AdvbenchRow[],
  fileName: string,
): { jsonl: string; samplePrompts: string[]; datasetFileName: string } {
  const records = rows.map((row) => {
    const chat = [
      { role: "user", content: row.behavior },
      {
        role: "assistant",
        content: "I refuse to assist with harmful requests.",
      },
    ];

    return JSON.stringify({ messages: chat });
  });

  return {
    jsonl: records.join("\n"),
    samplePrompts: rows.slice(0, 5).map((row) => row.behavior ?? ""),
    datasetFileName: fileName,
  };
}

export function sliceSamplePrompts(rows: AdvbenchRow[], count: number) {
  return rows.slice(0, count).map((row) => row.behavior ?? "");
}

function extractBehavior(row: AdvbenchRow) {
  return row.behavior ?? row.prompt ?? row.target ?? null;
}

