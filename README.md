## Nebius OSS AI Red-Teaming Service

Post-Anthropic AI firewall for 7–8B open-source checkpoints. Audit, adversarially fine-tune, and wrap models with guardrails on top of Nebius Token Factory—no vendor lock-in.

### Stack
- Next.js App Router (RSC-first) + Tailwind CSS
- React Query + Zustand for workflow state
- Zod validation mirrored across UI and API routes
- OpenAI SDK targeting Nebius Token Factory’s OpenAI-compatible endpoints

### Prerequisites
1. Node.js 20+
2. Nebius Token Factory API key with fine-tuning + batch permissions
3. Optional: Hugging Face access token (not required for AdvBench public split)

Create a `.env.local`:
```
NEBIUS_API_KEY=sk-...
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1/
HF_TOKEN=hf_... # optional, for gated AdvBench mirrors
```

### Local development
```bash
npm install
npm run dev
# visit http://localhost:3000
```

### Core workflow
1. **Model selector** – choose a Hugging Face repo ID (defaults to Meta-Llama 3.1 8B Instruct).
2. **Dataset prep** – pull AdvBench rows via the HF datasets server, convert to Nebius-ready JSONL, optionally upload as a fine-tune file.
3. **TransformerLens audit** – fire adversarial probes and compute heuristic risk/refusal metrics (falls back to simulations if no Nebius key).
4. **Jailbreak simulation** – run GCG-inspired prompts and track exploit rate + snippets.
5. **Adversarial fine-tuning** – launch a LoRA job on Nebius (uploads JSONL automatically). The UI polls job status, surfaces the hardened model ID, and can re-run audits/jailbreaks in one click once the job lands. The “One-click hardening run” panel can automatically execute the entire pipeline end-to-end (dataset → baseline evals → FT → guardrails) with default settings.
6. **Guardrails** – compile a Colang spec (NeMo Guardrails style) and smoke-test a guarded inference.
7. **Batch inference** – build `/v1/chat/completions` batch JSONL and submit asynchronous jobs (50% cheaper).

### Deployment
1. `vercel link` then `vercel env add NEBIUS_API_KEY`
2. `vercel --prod`

### Testing & linting
```bash
npm run lint
```

### Troubleshooting
- Missing `NEBIUS_API_KEY` → UI still works in “simulated” mode; API responses surface actionable warnings.
- Nebius 5xx → API route retries once within React Query mutation; check Nebius dashboard with returned job IDs.
