import { NextRequest } from "next/server";
import { uploadJsonlToNebius } from "@/lib/nebius";
import { handleError, success } from "@/lib/http";
import { z } from "zod";

const uploadSchema = z.object({
  jsonl: z.string().min(10),
  fileName: z.string().min(3).max(80),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jsonl, fileName } = uploadSchema.parse(body);
    
    const uploaded = await uploadJsonlToNebius(jsonl, fileName);
    
    return success({ fileId: uploaded.id });
  } catch (error) {
    return handleError(error);
  }
}

