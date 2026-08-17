import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const AppiumContextDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type AppiumContextDocsArgs = z.infer<typeof AppiumContextDocsSchema>;

const FULL_HEADER = `# API Reference — Appium Hybrid Context Switching (Appium 2.x+)`;

export async function handleAppiumContextDocs(args: AppiumContextDocsArgs) {
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
