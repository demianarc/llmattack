import { NextRequest, NextResponse } from "next/server";
import { handleError, success } from "@/lib/http";
import {
  generateSyntheticDataset,
  type RemediationReportInput,
} from "@/lib/arsenal";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as RemediationReportInput;
    if (!body.modelResults || body.modelResults.length === 0) {
      return NextResponse.json(
        { error: "No model results provided" },
        { status: 400 },
      );
    }

    const dataset = await generateSyntheticDataset(body);
    return success(dataset);
  } catch (error) {
    console.error("Arsenal dataset error:", error);
    return handleError(error);
  }
}

