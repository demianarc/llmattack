import { NextRequest } from "next/server";
import { handleJailbreak } from "@/lib/pipeline";
import { jailbreakSchema } from "@/lib/validators/pipeline";
import { handleError, success } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = jailbreakSchema.parse(body);
    const result = await handleJailbreak(parsed);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}

