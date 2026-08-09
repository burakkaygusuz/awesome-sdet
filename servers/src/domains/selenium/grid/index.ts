import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const GridDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type GridDocsArgs = z.infer<typeof GridDocsSchema>;

const FULL_HEADER = `# API Reference — RemoteWebDriver & Enterprise Selenium Grid 4`;

export async function handleGridDocs(args: GridDocsArgs) {
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
