import { z } from 'zod';
import { loadCachedReferenceMarkdown, sanitizeDomain, sanitizeLanguage } from '../shared.js';
import { FRAMEWORK_REGISTRY } from '../../registry.js';

export const PLAYWRIGHT_SUPPORTED_LANGUAGES = FRAMEWORK_REGISTRY.playwright.languages;

export const SupportedLanguageSchema = z
  .enum(PLAYWRIGHT_SUPPORTED_LANGUAGES)
  .default('typescript')
  .describe(
    'Target programming language: "typescript", "javascript", "python", "java", or "csharp". Defaults to "typescript".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const PLAYWRIGHT_DOMAINS = FRAMEWORK_REGISTRY.playwright.domains;

export const PlaywrightDomainSchema = z
  .enum(PLAYWRIGHT_DOMAINS)
  .describe('Supported Playwright documentation domain');

export type PlaywrightDomain = z.infer<typeof PlaywrightDomainSchema>;

export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: string = 'typescript'
): Promise<string> {
  const safeLang = sanitizeLanguage(language, PLAYWRIGHT_SUPPORTED_LANGUAGES, 'typescript');
  return loadCachedReferenceMarkdown(importMetaUrl, safeLang);
}

export async function readPlaywrightReferenceDoc(
  domain: string,
  language: string = 'typescript'
): Promise<string> {
  const safeDomain = sanitizeDomain(domain, PLAYWRIGHT_DOMAINS, 'locators', 'Playwright');
  const normLang = sanitizeLanguage(
    language,
    PLAYWRIGHT_SUPPORTED_LANGUAGES,
    'typescript',
    'Playwright'
  );
  const baseUrl = new URL(`./${safeDomain}/index.js`, import.meta.url).href;
  return loadReferenceMarkdown(baseUrl, normLang);
}
