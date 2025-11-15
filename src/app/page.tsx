import { WorkflowHero } from "@/components/workflow/hero";
import { ValueHighlights } from "@/components/workflow/value-highlights";
import { PipelineOverview } from "@/components/workflow/pipeline-overview";
import { RedTeamArsenal } from "@/components/workflow/red-team-arsenal";
import { AutomationPanel } from "@/components/workflow/automation-panel";
import { EvaluationPanel } from "@/components/workflow/evaluation-panel";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 md:px-8 lg:px-12">
      <WorkflowHero />
      <ValueHighlights />
      <PipelineOverview />

      {/* Core Red Teaming Workflow */}
      <RedTeamArsenal />
      <AutomationPanel />
      <EvaluationPanel />
    </main>
  );
}
