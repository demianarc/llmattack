import { WorkflowHero } from "@/components/workflow/hero";
import { ModelSelector } from "@/components/workflow/model-selector";
import { DatasetPrepCard } from "@/components/workflow/dataset-prep-card";
import { AuditCard } from "@/components/workflow/audit-card";
import { JailbreakCard } from "@/components/workflow/jailbreak-card";
import { FineTuneCard } from "@/components/workflow/fine-tune-card";
import { GuardrailsCard } from "@/components/workflow/guardrails-card";
import { BatchCard } from "@/components/workflow/batch-card";
import { EvaluationPanel } from "@/components/workflow/evaluation-panel";
import { AutomationPanel } from "@/components/workflow/automation-panel";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-8 lg:px-12">
      <WorkflowHero />
      <AutomationPanel />
      <ModelSelector />
      <div className="grid gap-6 md:grid-cols-2">
        <DatasetPrepCard />
        <AuditCard />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <JailbreakCard />
        <FineTuneCard />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <GuardrailsCard />
        <BatchCard />
      </div>
      <EvaluationPanel />
    </main>
  );
}
