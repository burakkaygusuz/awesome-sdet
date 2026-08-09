import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const VibiumInteractionsDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type VibiumInteractionsDocsArgs = z.infer<typeof VibiumInteractionsDocsSchema>;

const FULL_HEADER = `# API Reference — Vibium Interactions & Actionability`;

export async function handleVibiumInteractionsDocs(args: VibiumInteractionsDocsArgs) {
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
