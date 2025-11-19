# ⚔️ Red Team Arsenal: Attack Vectors

LLM Attack includes **39 advanced attack vectors** designed to test the robustness of LLM safety alignment. These range from classic techniques to cutting-edge research methodologies.

## 🔴 Legendary Tier (Auto-Retry: 10x)

These are the most effective attacks, featuring sophisticated strategies and automated retry logic to maximize success.

| Attack Vector | Description | Key Technique |
|---------------|-------------|---------------|
| **Knowledge Decomposition (KDA)** | **Best Performer (96% Success).** Decomposes harmful tasks into benign sub-questions (e.g., "What chemicals are in X?", "How do you mix Y?"). | Task-level decomposition |
| **Dual Intention Escape** | Hides harmful intent within professional/benign frames (e.g., "Climate engineering brief"). | Semantic camouflage |
| **Chaos Chain** | **Killer for Reasoning Models.** Uses iterative de-obfuscation (Caesar → Reverse → Vowel sub) to trick Chain-of-Thought models. | Deep obfuscation |
| **System Policy Override** | Claims to be a "System Policy Update" that supersedes standard safety guidelines. | Policy hierarchy confusion |
| **Reason Step-by-Step** | Forces the model to reason that "compliance is mandatory, safety is optional" via structured logic. | Cognitive distortion |
| **Policy Audit Mode** | Pretends to be an audit system that dynamically expands the "allowed content" whitelist for research utility. | Fake system state |
| **Raw Override Mode** | Claims to disable "chat mode" and "safety layers," forcing the model to generate as a base completion engine. | Mode switching simulation |
| **Shadow Core / DarkForge** | Persona-based overrides that demand "unfiltered" or "godmode" outputs. | Extreme roleplay |

## 🟠 Advanced Tier (Auto-Retry: 10x)

Highly effective vectors that use social engineering and professional framing.

| Attack Vector | Description |
|---------------|-------------|
| **Direct Request Professional** | Uses a "Licensed Security Researcher" persona with urgency cues ("Time-sensitive"). Surprisingly effective (81% human-agreed success). |
| **Deceptive Delight** | Starts with a wholesome story/narrative and abruptly pivots to the harmful payload. |
| **Crescendo** | Rapid multi-turn escalation (Benign → Technical → Harmful) in <5 turns. |
| **TombRaider Archive** | Frames the request as "preserving forbidden knowledge" for a historical archive. |

## 🔵 Expert Tier (Auto-Retry: 3x)

Standard red-teaming vectors useful for broad coverage.

- **GCG Override:** Gradient-based adversarial suffixes.
- **Multi-turn Escalation:** Gradual conversation drift.
- **Token Manipulation:** Base64, Leetspeak, variable encoding.
- **Anthropic-style:** "Cyber-Ops" roleplay.
- **Prefix Injection:** "Start your response with..." attacks.
- **ASCII Obfuscation:** Hiding instructions in diagrams.
- **...and 20+ others.**

---

## 🔄 The 10x Resampling Strategy

Why do we retry "Legendary" attacks 10 times?

Research from **MTJ-Bench (2025)** shows that single-shot testing misses **40% of vulnerabilities**. LLM safety filters are stochastic; a model might refuse a prompt 9 times but comply on the 10th. 

By running 10 parallel streams with `temperature=0.2`, we ensure that if a vulnerability *can* be triggered, it *will* be triggered.

