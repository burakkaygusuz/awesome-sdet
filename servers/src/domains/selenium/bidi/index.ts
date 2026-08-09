import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const BidiDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type BidiDocsArgs = z.infer<typeof BidiDocsSchema>;

const FULL_HEADER = `# API Reference — WebDriver BiDirectional (BiDi) Protocol`;

export async function handleBidiDocs(args: BidiDocsArgs) {
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
