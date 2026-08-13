import { z } from 'zod';
import { loadCachedReferenceMarkdown, resolveLanguage } from '../shared.js';

export const APPIUM_SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'java',
  'csharp',
] as const;

export const SupportedLanguageSchema = z
  .enum(APPIUM_SUPPORTED_LANGUAGES)
  .default('typescript')
  .describe(
    'Target programming language: "typescript", "javascript", "python", or "java". Defaults to "typescript".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const AppiumDomainSchema = z
  .enum(['capabilities', 'context', 'device', 'gestures', 'locators'] as const)
  .describe('Supported Appium documentation domain');

export type AppiumDomain = z.infer<typeof AppiumDomainSchema>;

export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: SupportedLanguage = 'typescript'
): Promise<string> {
  return loadCachedReferenceMarkdown(importMetaUrl, language, 'typescript');
}

export async function readAppiumReferenceDoc(
  domain: string,
  language: string = 'typescript'
): Promise<string> {
  const safeDomain = AppiumDomainSchema.parse((domain || '').toLowerCase().trim());
  const normLang = resolveLanguage(language, APPIUM_SUPPORTED_LANGUAGES, 'typescript', 'Appium');
  const baseUrl = new URL(`./${safeDomain}/index.js`, import.meta.url).href;
  return loadReferenceMarkdown(baseUrl, normLang);
}
