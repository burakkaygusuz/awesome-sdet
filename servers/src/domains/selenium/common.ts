import { z } from 'zod';
import { loadCachedReferenceMarkdown, sanitizeDomain, sanitizeLanguage } from '../shared.js';
import { FRAMEWORK_REGISTRY } from '../../registry.js';

export const SELENIUM_SUPPORTED_LANGUAGES = FRAMEWORK_REGISTRY.selenium.languages;

export const SupportedLanguageSchema = z
  .enum(SELENIUM_SUPPORTED_LANGUAGES)
  .default('java')
  .describe(
    'Target programming language: "java", "python", "typescript", "javascript", "csharp", or "ruby". Defaults to "java".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const SELENIUM_DOMAINS = FRAMEWORK_REGISTRY.selenium.domains;

export const SeleniumDomainSchema = z
  .enum(SELENIUM_DOMAINS)
  .describe('Supported Selenium documentation domain');

export type SeleniumDomain = z.infer<typeof SeleniumDomainSchema>;

export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: string = 'java'
): Promise<string> {
  const safeLang = sanitizeLanguage(language, SELENIUM_SUPPORTED_LANGUAGES, 'java');
  return loadCachedReferenceMarkdown(importMetaUrl, safeLang);
}

export async function readSeleniumReferenceDoc(
  domain: string,
  language: string = 'java'
): Promise<string> {
  const safeDomain = sanitizeDomain(domain, SELENIUM_DOMAINS, 'actions', 'Selenium');
  const normLang = sanitizeLanguage(language, SELENIUM_SUPPORTED_LANGUAGES, 'java', 'Selenium');
  const baseUrl = new URL(`./${safeDomain}/index.js`, import.meta.url).href;
  return loadReferenceMarkdown(baseUrl, normLang);
}
