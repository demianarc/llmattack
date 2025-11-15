import { NextRequest } from "next/server";
import { z } from "zod";
import { getModelStatus } from "@/lib/nebius";
import { handleError, success } from "@/lib/http";

const schema = z.object({
  name: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name");
    const parsed = schema.parse({ name });
    const result = await getModelStatus(parsed.name);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}

