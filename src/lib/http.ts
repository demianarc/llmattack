import { NextResponse } from "next/server";
import { ZodError } from "zod";
import {
  DatasetFetchError,
  NebiusConfigError,
  PipelineActionError,
  ValidationError,
} from "@/lib/errors";

export function success<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export function handleError(error: unknown) {
  if (error instanceof ZodError || error instanceof ValidationError) {
    return NextResponse.json(
      { error: "ValidationError", details: error.message },
      { status: 422 },
    );
  }

  if (error instanceof NebiusConfigError) {
    return NextResponse.json(
      {
        error: "NebiusConfigError",
        details: "Provide NEBIUS_API_KEY to execute this action.",
      },
      { status: 428 },
    );
  }

  if (
    error instanceof DatasetFetchError ||
    error instanceof PipelineActionError
  ) {
    return NextResponse.json(
      { error: error.name, details: error.message },
      { status: 502 },
    );
  }

  console.error(error);
  return NextResponse.json(
    { error: "UnknownError", details: "Unexpected server failure" },
    { status: 500 },
  );
}

