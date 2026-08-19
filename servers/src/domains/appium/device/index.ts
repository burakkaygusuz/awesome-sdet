import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const AppiumDeviceDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type AppiumDeviceDocsArgs = z.infer<typeof AppiumDeviceDocsSchema>;

const FULL_HEADER = `# API Reference — Appium Device & App Lifecycle Management (Appium 2.x+)`;

export async function handleAppiumDeviceDocs(args: AppiumDeviceDocsArgs) {
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
