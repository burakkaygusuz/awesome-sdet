import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const VibiumSelectorsDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type VibiumSelectorsDocsArgs = z.infer<typeof VibiumSelectorsDocsSchema>;

const FULL_HEADER = `# API Reference — Vibium Selectors & Locators`;

export async function handleVibiumSelectorsDocs(args: VibiumSelectorsDocsArgs) {
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
