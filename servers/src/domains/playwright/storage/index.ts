import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const PlaywrightStorageDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type PlaywrightStorageDocsArgs = z.infer<typeof PlaywrightStorageDocsSchema>;

const FULL_HEADER = `# API Reference — Playwright Storage State, Authentication & Context Fixtures`;

export async function handlePlaywrightStorageDocs(args: PlaywrightStorageDocsArgs) {
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
