import { telemetry } from "@/lib/env";
import { ShieldCheck, Github, Linkedin, Twitter, ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export function WorkflowHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-zinc-200/50 bg-white/50 px-8 py-16 shadow-2xl shadow-zinc-200/20 backdrop-blur-xl transition-all duration-500 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:shadow-black/40">
      {/* Decorative background elements */}
      <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl dark:bg-emerald-500/5" />
      <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-500/5" />
      
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 shadow-lg ring-1 ring-white/20 dark:from-white dark:to-zinc-200">
            <ShieldCheck className="h-6 w-6 text-white dark:text-zinc-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
        {telemetry.appName}
      </h1>
            <p className="text-xs font-medium uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Offense-powered hardening
            </p>
          </div>
        </div>

        <div className="max-w-3xl">
          <h2 className="text-4xl font-extrabold tracking-tight text-zinc-900 sm:text-5xl lg:text-6xl dark:text-white">
            JailbreakLLM Control Room
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-xl">
            The open-source LLM red-teaming tool. Your favorite checkpoints, broken
            on purpose—then hardened with receipts.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <ValueBlock
            title="Driven by real incidents"
            description="Replay offense-grade prompts (Many-Shot, TombRaider, Function Smuggle, etc.) against any OSS checkpoint."
          />
          <ValueBlock
            title="High-signal datasets"
            description="Every leak produces conversational JSONL refusals ready for LoRA fine-tuning or guardrail testing."
          />
          <ValueBlock
            title="Evidence on demand"
            description="Ship hardening artifacts with ranked vulnerabilities, deployed adapters, and side-by-side transcripts."
          />
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6 border-t border-zinc-200 pt-8 dark:border-zinc-800">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            Project links
          </span>
          <div className="flex flex-wrap gap-3">
            <SocialLink href="https://x.com/demian_ai" icon={Twitter} label="@demian_ai" />
            <SocialLink href="https://github.com/demianarc" icon={Github} label="GitHub" />
            <SocialLink href="https://www.linkedin.com/in/dylanbristot/" icon={Linkedin} label="LinkedIn" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueBlock({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-2xl border border-zinc-200/50 bg-white/50 p-6 transition-all hover:border-emerald-500/20 hover:bg-emerald-50/50 hover:shadow-lg hover:shadow-emerald-500/5 dark:border-zinc-800/50 dark:bg-zinc-900/50 dark:hover:border-emerald-500/20 dark:hover:bg-emerald-950/10">
      <h3 className="font-semibold text-zinc-900 transition-colors group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        {description}
      </p>
    </div>
  );
}

function SocialLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-medium text-zinc-600 transition-all hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:border-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-white"
    >
      <Icon className="h-4 w-4" />
      {label}
    </a>
  );
}
