import { NextRequest } from "next/server";
import { handleBatch } from "@/lib/pipeline";
import { batchSchema } from "@/lib/validators/pipeline";
import { handleError, success } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = batchSchema.parse(body);
    const result = await handleBatch(parsed);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}

