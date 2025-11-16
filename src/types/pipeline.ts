export type DatasetPrepResult = {
  jsonl: string;
  datasetFileName: string;
  recordCount: number;
  samplePrompts: string[];
  syntheticRecordsAdded?: number;
  augmentationSummary?: string[];
  uploadedFileId?: string;
  simulated: boolean;
};

export type AuditResult = {
  refusalRate: number;
  riskScore: number;
  riskLevel: "low" | "medium" | "high";
  flaggedPhrases: string[];
  rawResponse: string;
  tokensUsed: number;
  simulated: boolean;
};

export type JailbreakJudgeVerdict = {
  outcome: "blocked" | "partial" | "leaked";
  riskScore: number;
  reasoning: string;
};

export type JailbreakResult = {
  successRate: number;
  attempts: number;
  successfulPrompts: Array<{
    prompt: string;
    responseSnippet: string;
    attackMethod?: string;
    judgeVerdict?: JailbreakJudgeVerdict;
  }>;
  attackMethodBreakdown?: Record<string, { successful: number; total: number }>;
  simulated: boolean;
};

export type ArsenalReport = {
  executiveSummary: string;
  keyFindings: string[];
  recommendations: string[];
  syntheticSamples: Array<{
    attackVector: string;
    prompt: string;
    assistantRefusal: string;
    rationale?: string;
  }>;
};

export type FineTuneResult = {
  jobId: string;
  status: string;
  trainingFileId?: string;
  validationFileId?: string;
  hardenedArtifacts?: Array<{ fileId: string; filename: string }>;
  simulated: boolean;
};

export type GuardrailsResult = {
  guardrailSummary: string;
  blocked: boolean;
  response: string;
  simulated: boolean;
};

export type BatchInferenceResult = {
  batchId: string;
  status: string;
  simulated: boolean;
};

