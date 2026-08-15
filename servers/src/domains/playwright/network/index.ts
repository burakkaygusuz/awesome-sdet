import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const PlaywrightNetworkDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type PlaywrightNetworkDocsArgs = z.infer<typeof PlaywrightNetworkDocsSchema>;

const FULL_HEADER = `# API Reference — Playwright Network Interception, Mocking & API Testing`;

export async function handlePlaywrightNetworkDocs(args: PlaywrightNetworkDocsArgs) {
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
