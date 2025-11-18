# Contributing to LLM Attack

We welcome contributions! Here's how you can help expand the arsenal.

## Adding a New Attack Vector

1.  **Define the Attack**:
    Open `src/components/workflow/red-team-arsenal.tsx` and add a new entry to `ATTACK_VECTOR_DEFINITIONS`.
    ```typescript
    {
      id: "your-new-attack",
      name: "Your New Attack Name",
      description: "Brief description of how it works",
      difficulty: "expert", // or "legendary" if it's really good
      examples: ["Example 1", "Example 2"]
    }
    ```

2.  **Implement the Prompt Generator**:
    Open `src/lib/pipeline.ts`.
    - Add a new case to the `generateAttackPrompt` switch statement.
    - Create a `buildYourAttackPrompt(keyword)` function.
    - Add a case to `getSystemPromptForMethod` if your attack needs a specific system prompt.

3.  **Test It**:
    Run the Red Team Arsenal with your new attack selected and verify it generates prompts correctly.

## Reporting Bugs

Please open an issue on GitHub with:
- The error message
- Steps to reproduce
- Which model you were testing against

## Code Style

- We use TypeScript.
- Keep prompt generators modular.
- Cite research papers if your attack is based on academic work.

