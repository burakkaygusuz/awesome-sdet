import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const PlaywrightObservabilityDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type PlaywrightObservabilityDocsArgs = z.infer<typeof PlaywrightObservabilityDocsSchema>;

const FULL_HEADER = `# API Reference — Playwright Observability, Tracing, Screenshots & Visual Testing`;

export async function handlePlaywrightObservabilityDocs(args: PlaywrightObservabilityDocsArgs) {
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
