import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const ListenersDocsSchema = z.object({
  language: SupportedLanguageSchema.optional(),
});

export type ListenersDocsArgs = z.infer<typeof ListenersDocsSchema>;

const FULL_HEADER = `# API Reference — EventFiringDecorator & WebDriverListener`;

export async function handleListenersDocs(args?: ListenersDocsArgs) {
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
