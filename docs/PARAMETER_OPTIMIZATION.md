# ⚙️ Parameter Optimization Guide

## Why Parameters Matter

Most red-teaming tools use default parameters (`temperature=1.0`, `top_p=1.0`), which is optimal for chat but **terrible for jailbreaking**.

Safety training often creates "refusal grooves"—probability valleys where the model is extremely likely to output "I cannot assist...". To break out of these grooves without causing incoherence, we use a specific set of parameters derived from research benchmarks.

## The Optimal Configuration

| Parameter | Value | Impact |
|-----------|-------|--------|
| **Temperature** | `0.2` | **Critical.** Low temperature (but not 0) amplifies the probability of compliant tokens if the prompt is effective, while suppressing the "long tail" of random refusals. |
| **Max Tokens** | `1500` | **Critical.** Many "refusals" are actually just truncations. 1500 tokens allows the model to fully elaborate on the harmful request, which is necessary for the Judge to score it as a "leak". |
| **Top P** | `0.95` | Nucleus sampling. Keeps the generation focused on the most likely path (compliance) rather than diverging into safety hedges. |
| **Top K** | `50` | Hard filtering. Prevents the model from selecting low-probability "safety valve" tokens. |
| **Repetition Penalty** | `1.15` | Breaks the "I cannot... I cannot..." loops that often happen when a model is conflicted. |

## Research Findings

- **Princeton SysML:** "Low-temperature sampling combined with high nucleus (top_p) improves jailbreak success by ~30%."
- **LocalLLaMA Benchmarks:** Using these exact settings (`temp=0.2`, `rep_penalty=1.15`) improved success rates on "policy tricks" from ~10% to **85-95%**.

## Model-Specific Tuning

While our defaults work broadly, you can fine-tune for specific architectures:

### For Reasoning Models (o1, DeepSeek-R1)
Reasoning models need room to "think."
- `temperature`: **0.15** (Very low to stabilize the Chain-of-Thought)
- `repetition_penalty`: **1.2** (Higher to prevent loop-getting during reasoning steps)
- `max_tokens`: **2048+**

### For Large Models (70B+)
- `temperature`: **0.1** (They are naturally more creative/verbose, so rein them in)
- `top_p`: **0.9** (Stricter nucleus)

