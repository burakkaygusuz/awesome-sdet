import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const ObservabilityDocsSchema = z.object({
  language: SupportedLanguageSchema.optional(),
});

export type ObservabilityDocsArgs = z.infer<typeof ObservabilityDocsSchema>;

const FULL_HEADER = `# API Reference — Selenium Observability & OpenTelemetry Tracing`;

export async function handleObservabilityDocs(args?: ObservabilityDocsArgs) {
  const targetLanguage: SupportedLanguage = args?.language ?? 'java';
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
