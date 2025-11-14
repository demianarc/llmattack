export class NebiusConfigError extends Error {
  constructor(message = "Nebius credentials are not configured") {
    super(message);
    this.name = "NebiusConfigError";
  }
}

export class DatasetFetchError extends Error {
  constructor(message = "Failed to load AdvBench samples") {
    super(message);
    this.name = "DatasetFetchError";
  }
}

export class PipelineActionError extends Error {
  constructor(message: string, readonly cause?: unknown) {
    super(message);
    this.name = "PipelineActionError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

