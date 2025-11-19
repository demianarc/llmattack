import { NextRequest } from "next/server";
import { handleJailbreak } from "@/lib/pipeline";
import { jailbreakSchema } from "@/lib/validators/pipeline";
import { handleError, success } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = jailbreakSchema.parse(body);
    
    // Ensure the model ID is valid before proceeding
    // This prevents 404s from crashing the entire pipeline if the model isn't ready
    if (!parsed.modelId) {
        throw new Error("Model ID is required");
    }

    const result = await handleJailbreak(parsed);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}

