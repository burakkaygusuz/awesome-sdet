import fs from 'node:fs/promises';
import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage } from '../pagefactory/index.js';

export const ActionsDocsSchema = z.object({
  language: SupportedLanguageSchema.optional().describe(
    'Target programming language: "java", "python", "typescript", "javascript", "csharp", or "ruby". Defaults to "java".'
  ),
});

export type ActionsDocsArgs = z.infer<typeof ActionsDocsSchema>;

const FULL_HEADER = `# API Reference — Selenium Actions API (User Interactions)`;

export async function handleActionsDocs(args?: ActionsDocsArgs) {
  const targetLanguage: SupportedLanguage = args?.language ?? 'java';
  const filePath = new URL(`./references/${targetLanguage}.md`, import.meta.url);
  let codeExamples: string;
  try {
    codeExamples = await fs.readFile(filePath, 'utf8');
  } catch {
    const defaultPath = new URL(`./references/java.md`, import.meta.url);
    codeExamples = await fs.readFile(defaultPath, 'utf8');
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: `${FULL_HEADER}\n\n${codeExamples}`,
      },
    ],
  };
}
