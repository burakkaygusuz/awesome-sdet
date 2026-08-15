import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const PlaywrightAssertionsDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type PlaywrightAssertionsDocsArgs = z.infer<typeof PlaywrightAssertionsDocsSchema>;

const FULL_HEADER = `# API Reference — Playwright Web-First Assertions & Polling`;

export async function handlePlaywrightAssertionsDocs(args: PlaywrightAssertionsDocsArgs) {
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
