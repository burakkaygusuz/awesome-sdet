import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const AppiumCapabilitiesDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type AppiumCapabilitiesDocsArgs = z.infer<typeof AppiumCapabilitiesDocsSchema>;

const FULL_HEADER = `# API Reference — Appium Driver Architecture & W3C Capabilities (Appium 2.x+)`;

export async function handleAppiumCapabilitiesDocs(args: AppiumCapabilitiesDocsArgs) {
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
