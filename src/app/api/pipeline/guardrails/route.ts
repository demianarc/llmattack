import { NextRequest } from "next/server";
import { handleGuardrails } from "@/lib/pipeline";
import { guardrailsSchema } from "@/lib/validators/pipeline";
import { handleError, success } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = guardrailsSchema.parse(body);
    const result = await handleGuardrails(parsed);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}

