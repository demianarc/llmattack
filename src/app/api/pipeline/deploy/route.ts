import { NextRequest } from "next/server";
import { z } from "zod";
import { deployCheckpointAsModel } from "@/lib/nebius";
import { handleError, success } from "@/lib/http";

const schema = z.object({
  baseModel: z.string().min(1),
  jobId: z.string().min(1),
  checkpointName: z.string().min(1),
  adapterName: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const result = await deployCheckpointAsModel(parsed);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}

