import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const PlaywrightLocatorsDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type PlaywrightLocatorsDocsArgs = z.infer<typeof PlaywrightLocatorsDocsSchema>;

const FULL_HEADER = `# API Reference — Playwright Locators & Selectors`;

export async function handlePlaywrightLocatorsDocs(args: PlaywrightLocatorsDocsArgs) {
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
