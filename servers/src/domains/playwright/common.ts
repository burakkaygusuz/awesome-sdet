import { z } from 'zod';
import { loadCachedReferenceMarkdown, resolveLanguage } from '../shared.js';

export const PLAYWRIGHT_SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'java',
  'csharp',
] as const;

export const SupportedLanguageSchema = z
  .enum(PLAYWRIGHT_SUPPORTED_LANGUAGES)
  .default('typescript')
  .describe(
    'Target programming language: "typescript", "javascript", "python", "java", or "csharp". Defaults to "typescript".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const PlaywrightDomainSchema = z
  .enum(['actions', 'assertions', 'locators', 'network', 'observability', 'storage'] as const)
  .describe('Supported Playwright documentation domain');

export type PlaywrightDomain = z.infer<typeof PlaywrightDomainSchema>;

export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: SupportedLanguage = 'typescript'
): Promise<string> {
  return loadCachedReferenceMarkdown(importMetaUrl, language, 'typescript');
}

export async function readPlaywrightReferenceDoc(
  domain: string,
  language: string = 'typescript'
): Promise<string> {
  const safeDomain = PlaywrightDomainSchema.parse((domain || '').toLowerCase().trim());
  const normLang = resolveLanguage(
    language,
    PLAYWRIGHT_SUPPORTED_LANGUAGES,
    'typescript',
    'Playwright'
  );
  const baseUrl = new URL(`./${safeDomain}/index.js`, import.meta.url).href;
  return loadReferenceMarkdown(baseUrl, normLang);
}
