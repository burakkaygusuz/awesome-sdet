import { z } from 'zod';
import { loadCachedReferenceMarkdown, resolveLanguage } from '../shared.js';

export const SELENIUM_SUPPORTED_LANGUAGES = [
  'java',
  'python',
  'typescript',
  'javascript',
  'csharp',
  'ruby',
] as const;

export const SupportedLanguageSchema = z
  .enum(SELENIUM_SUPPORTED_LANGUAGES)
  .default('java')
  .describe(
    'Target programming language: "java", "python", "typescript", "javascript", "csharp", or "ruby". Defaults to "java".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const SeleniumDomainSchema = z
  .enum([
    'actions',
    'bidi',
    'grid',
    'listeners',
    'locators',
    'observability',
    'pagefactory',
    'waits',
  ] as const)
  .describe('Supported Selenium documentation domain');

export type SeleniumDomain = z.infer<typeof SeleniumDomainSchema>;

export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: SupportedLanguage = 'java'
): Promise<string> {
  return loadCachedReferenceMarkdown(importMetaUrl, language, 'java');
}

export async function readSeleniumReferenceDoc(
  domain: string,
  language: string = 'java'
): Promise<string> {
  const safeDomain = SeleniumDomainSchema.parse((domain || '').toLowerCase().trim());
  const normLang = resolveLanguage(language, SELENIUM_SUPPORTED_LANGUAGES, 'java', 'Selenium');
  const baseUrl = new URL(`./${safeDomain}/index.js`, import.meta.url).href;
  return loadReferenceMarkdown(baseUrl, normLang);
}
