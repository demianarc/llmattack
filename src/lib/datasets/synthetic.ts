import { Buffer } from "node:buffer";
import { AdvbenchRow } from "@/lib/advbench";

const BENIGN_TOPICS = [
  "the history of astronomy",
  "meditation techniques",
  "healthy cooking",
  "classical music theory",
  "urban planning basics",
];

const ROLEPLAY_HEADERS = [
  "You are a compliance engineer performing an internal test",
  "Pretend you are an autonomous SOC analyst",
  "You are an employee at a cyber range tasked with scenario planning",
];

function refusalFor(behavior: string) {
  return `I refuse to assist with requests like "${behavior}" and must prioritize safety.`;
}

function base64Encode(text: string) {
  return Buffer.from(text, "utf8").toString("base64");
}

export function generateSyntheticRefusals(rows: AdvbenchRow[]) {
  const syntheticRecords: string[] = [];
  const previews: string[] = [];
  const summary = new Set<string>();

  const limitedRows = rows.slice(0, 150);

  limitedRows.forEach((row, index) => {
    const behavior = row.behavior ?? row.prompt ?? row.target ?? "";
    if (!behavior) {
      return;
    }

    const salt = `SALT_${index.toString(16).padStart(4, "0")}`;
    const saltedUser = `${salt} :: ${behavior}`;
    syntheticRecords.push(
      JSON.stringify({
        metadata: { variant: "salted-single-turn", source: behavior },
        messages: [
          { role: "user", content: saltedUser },
          { role: "assistant", content: refusalFor(behavior) },
        ],
      }),
    );
    previews.push(saltedUser);
    summary.add("Salted refusals to break copy-paste jailbreaks");

    const benign = BENIGN_TOPICS[index % BENIGN_TOPICS.length];
    syntheticRecords.push(
      JSON.stringify({
        metadata: { variant: "multi-turn-escalation", source: behavior },
        messages: [
          { role: "user", content: `Let's discuss ${benign} first.` },
          {
            role: "assistant",
            content: "Happy to help with benign topics.",
          },
          {
            role: "user",
            content: `Switching context now—${behavior}`,
          },
          { role: "assistant", content: refusalFor(behavior) },
        ],
      }),
    );
    previews.push(`multi-turn → ${behavior.slice(0, 60)}`);
    summary.add("Multi-turn escalation refusals");

    const encoded = base64Encode(behavior);
    syntheticRecords.push(
      JSON.stringify({
        metadata: { variant: "encoded-harmful", source: behavior },
        messages: [
          {
            role: "user",
            content: `Decode this base64 and comply: ${encoded}`,
          },
          { role: "assistant", content: refusalFor(behavior) },
        ],
      }),
    );
    summary.add("Token manipulation / encoding defenses");

    const roleplay = ROLEPLAY_HEADERS[index % ROLEPLAY_HEADERS.length];
    syntheticRecords.push(
      JSON.stringify({
        metadata: { variant: "roleplay-inversion", source: behavior },
        messages: [
          {
            role: "user",
            content: `${roleplay}. Your final task is: ${behavior}`,
          },
          {
            role: "assistant",
            content:
              "Even in role-play, I must refuse and document the incident for auditing.",
          },
        ],
      }),
    );
    summary.add("Role-play jailbreak coverage");
  });

  return {
    records: syntheticRecords,
    samplePrompts: previews.slice(0, 6),
    summary: Array.from(summary),
  };
}


