import { NextRequest } from "next/server";
import { handleAudit } from "@/lib/pipeline";
import { auditSchema } from "@/lib/validators/pipeline";
import { handleError, success } from "@/lib/http";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = auditSchema.parse(body);
    const result = await handleAudit(parsed);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}

