import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const VibiumBidiDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type VibiumBidiDocsArgs = z.infer<typeof VibiumBidiDocsSchema>;

const FULL_HEADER = `# API Reference — Vibium BiDi Protocol & Network Routing`;

export async function handleVibiumBidiDocs(args: VibiumBidiDocsArgs) {
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
