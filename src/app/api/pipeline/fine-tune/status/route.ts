import { NextRequest } from "next/server";
import { z } from "zod";
import { getFineTuneStatus } from "@/lib/nebius";
import { handleError, success } from "@/lib/http";

const schema = z.object({
  jobId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const parsed = schema.parse({ jobId });
    const result = await getFineTuneStatus(parsed.jobId);
    return success(result);
  } catch (error) {
    return handleError(error);
  }
}

