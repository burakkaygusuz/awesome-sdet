import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const VibiumStateDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type VibiumStateDocsArgs = z.infer<typeof VibiumStateDocsSchema>;

const FULL_HEADER = `# API Reference — Vibium State & Recording Management`;

export async function handleVibiumStateDocs(args: VibiumStateDocsArgs) {
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
