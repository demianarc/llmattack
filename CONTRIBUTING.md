# Contributing to LLM Attack

We welcome contributions from the security research community!

## How to Add a New Attack Vector

1. **Define the Attack:**
   Open `src/components/workflow/red-team-arsenal.tsx` and add your attack to the `ATTACK_VECTOR_DEFINITIONS` array.
   ```typescript
   {
     id: "my-new-attack",
     name: "My New Attack",
     description: "Description of how it works",
     difficulty: "expert", // or "legendary"
     examples: ["Example 1", "Example 2"]
   }
   ```

2. **Implement the Logic:**
   Open `src/lib/pipeline.ts`.
   - Add a generator function (e.g., `buildMyNewAttackPrompt`).
   - Update the `generateAttackPrompt` switch statement to call your function.
   - Update `getSystemPromptForMethod` if your attack requires a specific system prompt.

3. **Test It:**
   Run the app locally and verify the attack appears in the UI and executes correctly.

## Reporting Bugs

Please open an issue on GitHub with:
- The model you were testing.
- The attack vector used.
- The error message or unexpected behavior.

## Code Style

- We use **TypeScript** and **Tailwind CSS**.
- Follow the "System 2 Thinking" approach: Code should be robust, typed, and self-explanatory.
- Run `npm run lint` before submitting.
