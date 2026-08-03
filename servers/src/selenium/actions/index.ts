import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const ActionsDocsSchema = z.object({
  language: SupportedLanguageSchema.optional(),
});

export type ActionsDocsArgs = z.infer<typeof ActionsDocsSchema>;

const FULL_HEADER = `# API Reference — Selenium Actions API (User Interactions)`;

export async function handleActionsDocs(args?: ActionsDocsArgs) {
  const targetLanguage: SupportedLanguage = args?.language ?? 'java';
  const codeExamples = await loadReferenceMarkdown(import.meta.url, targetLanguage);

  return {
    content: [
      {
        type: 'text' as const,
        text: `${FULL_HEADER}\n\n${codeExamples}`,
      },
    ],
  };
}
