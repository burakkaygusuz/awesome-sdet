import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const PlaywrightActionsDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type PlaywrightActionsDocsArgs = z.infer<typeof PlaywrightActionsDocsSchema>;

const FULL_HEADER = `# API Reference — Playwright Actions & Auto-Waiting`;

export async function handlePlaywrightActionsDocs(args: PlaywrightActionsDocsArgs) {
  const targetLanguage: SupportedLanguage = args.language;
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
