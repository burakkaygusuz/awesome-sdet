import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const VibiumCoreDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type VibiumCoreDocsArgs = z.infer<typeof VibiumCoreDocsSchema>;

const FULL_HEADER = `# API Reference — Vibium Core & CLI Architecture`;

export async function handleVibiumCoreDocs(args: VibiumCoreDocsArgs) {
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
