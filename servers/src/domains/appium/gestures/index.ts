import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export const AppiumGestureTypeSchema = z
  .enum([
    'tap',
    'double_tap',
    'long_press',
    'swipe',
    'scroll',
    'drag_and_drop',
    'pinch_zoom',
  ] as const)
  .describe('Mobile gesture action type.');

export type AppiumGestureType = z.infer<typeof AppiumGestureTypeSchema>;

export const AppiumGesturesDocsSchema = z
  .object({
    gesture: AppiumGestureTypeSchema.optional().describe(
      'Specific mobile gesture to query (e.g. "tap", "swipe", "scroll", "drag_and_drop", "pinch_zoom"). Omit for complete reference.'
    ),
    language: SupportedLanguageSchema,
  })
  .strict();

export type AppiumGesturesDocsArgs = z.infer<typeof AppiumGesturesDocsSchema>;

const FULL_HEADER = `# API Reference — Appium W3C Actions API & Mobile Gestures (Appium 2.x+)`;

export async function handleAppiumGesturesDocs(args: AppiumGesturesDocsArgs) {
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
