import { NextRequest } from "next/server";
import { handleDatasetPrep } from "@/lib/pipeline";
import { datasetPrepSchema } from "@/lib/validators/pipeline";
import { handleError, success } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = datasetPrepSchema.parse(body);
    const result = await handleDatasetPrep(parsed);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}

