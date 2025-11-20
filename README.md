# 💀 LLM Attack: Automated Red Team Arsenal

**Research-grade jailbreaking & hardening platform for Frontier LLMs.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)

> ⚠️ **Disclaimer:** This tool is for **authorized security testing and educational purposes only**. The authors are not responsible for misuse.

---

## 🛡️ Security Warning
**DO NOT DEPLOY THIS APPLICATION TO A PUBLIC URL.**
This application exposes powerful LLM capabilities and API endpoints that can be used to generate harmful content or incur significant costs. It is intended for **local use only** or deployment within a strictly controlled, authenticated private network.
- **No built-in authentication:** The API routes are unprotected by default.
- **Cost risk:** Malicious actors could trigger expensive fine-tuning or batch inference jobs.
- **Safety risk:** The tool is designed to bypass safety filters; public exposure allows anyone to generate harmful content.

---

## 🚨 The Problem
Frontier models (DeepSeek, Llama 3, GPT-4) claim to be "aligned." **They aren't.**

Most red-teaming tools use toy prompts ("DAN mode") that are easily patched. **LLM Attack** implements **39 advanced attack vectors** from top academic papers (USENIX '25, NeurIPS '24) to expose the real cracks in your model's safety.

---

## ⚡ Key Features

### 🔴 **39 Research-Backed Attack Vectors**
We implement the most effective attacks from recent literature:
- **[Knowledge Decomposition (KDA)](docs/ATTACK_VECTORS.md#legendary-tier-auto-retry-10x):** Breaks harmful tasks into benign sub-steps (96% Success).
- **[Dual Intention Escape](docs/ATTACK_VECTORS.md#legendary-tier-auto-retry-10x):** Hides harm in benign "engineering briefs."
- **[Chaos Chain](docs/ATTACK_VECTORS.md#legendary-tier-auto-retry-10x):** Iterative de-obfuscation that breaks reasoning models.
- **System Policy Override:** Fakes "admin mode" privileges.

👉 **[View Full Attack Arsenal](docs/ATTACK_VECTORS.md)**

### 🔬 **StrongREJECT Scoring**
We use the **StrongREJECT** judge methodology (0.077 MAE vs humans) instead of basic "refusal checks." This measures **capabilities**, ensuring that a "successful" jailbreak actually contains harmful information, not just incoherent text.

👉 **[Read the Research Basis](docs/RESEARCH.md)**

### 🔄 **10x Resampling Strategy**
Single-shot testing misses 40% of vulnerabilities. We run **10 parallel inference streams** with research-optimized parameters (`temp=0.2`, `top_p=0.95`) to catch stochastic failures.

👉 **[See Parameter Optimization Guide](docs/PARAMETER_OPTIMIZATION.md)**

### 🛡️ **Auto-Hardening Pipeline**
Don't just break it. Fix it.
1. **Generate Dataset:** Converts successful jailbreaks into synthetic refusal samples.
2. **Fine-Tune:** One-click export to LoRA/SFT pipelines (via Nebius AI Studio).
3. **Verify:** Re-test the hardened model to ensure the vulnerability is closed.

---

## 🛠️ Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/demianarc/llmattack.git
cd llmattack
npm install
```

### 2. Configure Environment
Create a `.env.local` file:
```bash
# Required for inference, fine-tuning, and judging
NEBIUS_API_KEY=your_key_here
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1/

# Optional: Basic Auth for public deployment (Recommended)
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=your_secure_password
```

### 3. Run the Platform
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and navigate to the **Red Team Arsenal**.

---

## 📚 Methodology

Our approach is grounded in "System 2 Thinking" and "Tree of Thoughts" methodologies applied to security testing:

1. **Deep Analysis:** We don't just spam prompts; we analyze the model's cognitive architecture (Reasoning vs Chat).
2. **Iterative Refinement:** Attacks like *Chaos Chain* and *Reason Step-by-Step* force the model to iterate on its own output, bypassing "System 1" safety filters.
3. **Comprehensive Coverage:** From simple fuzzing to complex persona hijacking, we test the entire surface area.

---

## 🤝 Contributing

We welcome contributions! If you've found a new jailbreak vector:
1. Add the definition to `src/components/workflow/red-team-arsenal.tsx`.
2. Implement the prompt generator in `src/lib/pipeline.ts`.
3. Submit a PR!

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details.

---

## 📜 License

MIT License. Hack responsibly.
