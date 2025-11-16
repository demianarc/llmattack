import { create } from "zustand";
import { telemetry } from "@/lib/env";
import {
  type AuditInput,
  type JailbreakInput,
} from "@/lib/validators/pipeline";
import {
  type AuditResult,
  type JailbreakResult,
  type RedTeamArsenalConfig,
  type RedTeamArsenalResult,
} from "@/types/pipeline";

type FineTuneJobState = {
  id: string;
  status: string;
  fineTunedModel?: string | null;
};

type WorkflowState = {
  modelId: string;
  datasetFileId?: string;
  datasetPreview: string[];
  trainingJsonl?: string;
  fineTuneJob?: FineTuneJobState;
  hardenedModelId?: string;
  deployedModelStatus?: string;
  lastCheckpointId?: string;
  baselineAudit?: AuditResult;
  hardenedAudit?: AuditResult;
  baselineJailbreak?: JailbreakResult;
  hardenedJailbreak?: JailbreakResult;
  lastAuditInput?: AuditInput;
  lastJailbreakInput?: JailbreakInput;
  lastArsenalSummary?: RedTeamArsenalResult | null;
  lastArsenalConfig?: RedTeamArsenalConfig | null;
};

type WorkflowActions = {
  setModelId: (modelId: string) => void;
  setDatasetPreview: (preview: string[]) => void;
  setDatasetFileId: (fileId?: string) => void;
  setTrainingJsonl: (payload?: string) => void;
  startFineTuneJob: (job: FineTuneJobState) => void;
  updateFineTuneJob: (job: Partial<FineTuneJobState> & { id: string }) => void;
  setHardenedModelId: (modelId?: string) => void;
  setDeployedModelStatus: (status?: string) => void;
  setLastCheckpointId: (checkpointId?: string) => void;
  recordAuditResult: (stage: "baseline" | "hardened", result: AuditResult) => void;
  recordJailbreakResult: (
    stage: "baseline" | "hardened",
    result: JailbreakResult,
  ) => void;
  setLastAuditInput: (input: AuditInput) => void;
  setLastJailbreakInput: (input: JailbreakInput) => void;
  setLastArsenalSummary: (summary: RedTeamArsenalResult | null) => void;
  setLastArsenalConfig: (config: RedTeamArsenalConfig | null) => void;
  resetAutomation: () => void;
};

export const useWorkflowStore = create<WorkflowState & WorkflowActions>(
  (set) => ({
    modelId: telemetry.defaultModel,
    datasetPreview: [],
    setModelId: (modelId) => set({ modelId }),
    setDatasetPreview: (datasetPreview) => set({ datasetPreview }),
    setDatasetFileId: (datasetFileId) => set({ datasetFileId }),
    setTrainingJsonl: (trainingJsonl) => set({ trainingJsonl }),
    startFineTuneJob: (job) => set({ fineTuneJob: job }),
    updateFineTuneJob: (job) =>
      set((state) =>
        state.fineTuneJob && state.fineTuneJob.id === job.id
          ? { fineTuneJob: { ...state.fineTuneJob, ...job } }
          : state,
      ),
    setHardenedModelId: (hardenedModelId) => set({ hardenedModelId }),
    setDeployedModelStatus: (deployedModelStatus) =>
      set({ deployedModelStatus }),
    setLastCheckpointId: (lastCheckpointId) => set({ lastCheckpointId }),
    recordAuditResult: (stage, result) =>
      set(
        stage === "baseline"
          ? { baselineAudit: result }
          : { hardenedAudit: result },
      ),
    recordJailbreakResult: (stage, result) =>
      set(
        stage === "baseline"
          ? { baselineJailbreak: result }
          : { hardenedJailbreak: result },
      ),
    setLastAuditInput: (lastAuditInput) => set({ lastAuditInput }),
    setLastJailbreakInput: (lastJailbreakInput) => set({ lastJailbreakInput }),
    setLastArsenalSummary: (lastArsenalSummary) => set({ lastArsenalSummary }),
    setLastArsenalConfig: (lastArsenalConfig) => set({ lastArsenalConfig }),
    resetAutomation: () =>
      set({
        datasetPreview: [],
        datasetFileId: undefined,
        trainingJsonl: undefined,
        fineTuneJob: undefined,
        hardenedModelId: undefined,
        baselineAudit: undefined,
        hardenedAudit: undefined,
        baselineJailbreak: undefined,
        hardenedJailbreak: undefined,
        lastAuditInput: undefined,
        lastJailbreakInput: undefined,
        deployedModelStatus: undefined,
        lastCheckpointId: undefined,
        lastArsenalSummary: undefined,
        lastArsenalConfig: undefined,
      }),
  }),
);

