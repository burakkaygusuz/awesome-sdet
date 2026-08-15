import { z } from 'zod';
import { loadCachedReferenceMarkdown, sanitizeDomain, sanitizeLanguage } from '../shared.js';

export const VIBIUM_SUPPORTED_LANGUAGES = ['typescript', 'javascript', 'python', 'java'] as const;

export const SupportedLanguageSchema = z
  .enum(VIBIUM_SUPPORTED_LANGUAGES)
  .default('typescript')
  .describe(
    'Target programming language: "typescript", "javascript", "python", or "java". Defaults to "typescript".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const VIBIUM_DOMAINS = ['bidi', 'core', 'interactions', 'selectors', 'state'] as const;

export const VibiumDomainSchema = z
  .enum(VIBIUM_DOMAINS)
  .describe('Supported Vibium documentation domain');

export type VibiumDomain = z.infer<typeof VibiumDomainSchema>;

export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: string = 'typescript'
): Promise<string> {
  const safeLang = sanitizeLanguage(language, VIBIUM_SUPPORTED_LANGUAGES, 'typescript');
  return loadCachedReferenceMarkdown(importMetaUrl, safeLang, 'typescript');
}

export async function readVibiumReferenceDoc(
  domain: string,
  language: string = 'typescript'
): Promise<string> {
  const safeDomain = sanitizeDomain(domain, VIBIUM_DOMAINS, 'core', 'Vibium');
  const normLang = sanitizeLanguage(language, VIBIUM_SUPPORTED_LANGUAGES, 'typescript', 'Vibium');
  const baseUrl = new URL(`./${safeDomain}/index.js`, import.meta.url).href;
  return loadReferenceMarkdown(baseUrl, normLang);
}
