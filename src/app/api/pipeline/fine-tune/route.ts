import { NextRequest } from "next/server";
import { handleFineTune } from "@/lib/pipeline";
import { fineTuneSchema } from "@/lib/validators/pipeline";
import { handleError, success } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = fineTuneSchema.parse(body);
    const result = await handleFineTune(parsed);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}

