import { z } from 'zod';
import { loadCachedReferenceMarkdown, sanitizeDomain, sanitizeLanguage } from '../shared.js';
import { FRAMEWORK_REGISTRY } from '../../registry.js';

export const APPIUM_SUPPORTED_LANGUAGES = FRAMEWORK_REGISTRY.appium.languages;

export const SupportedLanguageSchema = z
  .enum(APPIUM_SUPPORTED_LANGUAGES)
  .default('typescript')
  .describe(
    'Target programming language: "typescript", "javascript", "python", "java", or "csharp". Defaults to "typescript".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const APPIUM_DOMAINS = FRAMEWORK_REGISTRY.appium.domains;

export const AppiumDomainSchema = z
  .enum(APPIUM_DOMAINS)
  .describe('Supported Appium documentation domain');

export type AppiumDomain = z.infer<typeof AppiumDomainSchema>;

export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: string = 'typescript'
): Promise<string> {
  const safeLang = sanitizeLanguage(language, APPIUM_SUPPORTED_LANGUAGES, 'typescript');
  return loadCachedReferenceMarkdown(importMetaUrl, safeLang);
}

export async function readAppiumReferenceDoc(
  domain: string,
  language: string = 'typescript'
): Promise<string> {
  const safeDomain = sanitizeDomain(domain, APPIUM_DOMAINS, 'capabilities', 'Appium');
  const normLang = sanitizeLanguage(language, APPIUM_SUPPORTED_LANGUAGES, 'typescript', 'Appium');
  const baseUrl = new URL(`./${safeDomain}/index.js`, import.meta.url).href;
  return loadReferenceMarkdown(baseUrl, normLang);
}
