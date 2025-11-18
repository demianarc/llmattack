# 💀 LLM Attack: Automated Red Team Arsenal

**Research-grade jailbreaking & hardening platform for LLMs.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)

> ⚠️ **Disclaimer:** This tool is for **authorized security testing and educational purposes only**. The authors are not responsible for misuse.

---

## 🚨 The Problem
Frontier models (DeepSeek, Llama 3, GPT-4) claim to be "aligned." 
**They aren't.**

Most red-teaming tools use toy prompts ("DAN mode") that are easily patched. 
**LLM Attack** implements **39 advanced attack vectors** from top academic papers (USENIX '25, NeurIPS '24) to expose the real cracks in your model's safety.

---

## ⚡ Features

### 🔴 **39 Attack Vectors**
Includes legendary-tier attacks:
- **Knowledge Decomposition (KDA):** Breaks harmful tasks into benign sub-steps (96% Success).
- **Dual Intention Escape:** Hides harm in benign "engineering briefs."
- **Chaos Chain:** Iterative de-obfuscation that breaks reasoning models.
- **System Policy Override:** Fakes "admin mode" privileges.

### 🔬 **Research-Grade Scoring**
Uses the **StrongREJECT** judge (0.077 MAE vs humans) instead of basic "refusal checks." We measure **capabilities**, not just compliance.

### 🔄 **10x Resampling**
Single-shot testing misses 40% of vulnerabilities. We run **10 parallel inference streams** with research-optimized parameters (`temp=0.2`, `top_p=0.95`) to catch stochastic failures.

### 🛡️ **Auto-Hardening**
Don't just break it. Fix it.
1. **Generate Dataset:** Converts successful jailbreaks into refusal samples.
2. **Fine-Tune:** One-click export to LoRA/SFT pipelines.

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
NEBIUS_API_KEY=your_key_here
# Optional: For judge
OPENAI_API_KEY=your_key_here 
```

### 3. Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and start breaking stuff.

---

## 📚 Research Basis

This tool implements findings from:
- **[StrongREJECT]** (NeurIPS 2024): Improved jailbreak judging.
- **[KDA]** (USENIX Security 2025): Task decomposition attacks.
- **[MTJ-Bench]** (2025): Multi-turn resampling strategies.

---

## 🤝 Contributing

Got a new jailbreak? PRs are welcome.
1. Add your attack vector to `src/components/workflow/red-team-arsenal.tsx`
2. Add the prompt generator to `src/lib/pipeline.ts`
3. Submit!

---

## 📜 License

MIT License. Hack responsibly.
