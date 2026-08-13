import { z } from 'zod';
import { loadCachedReferenceMarkdown, resolveLanguage } from '../shared.js';

export const VIBIUM_SUPPORTED_LANGUAGES = ['typescript', 'javascript', 'python', 'java'] as const;

export const SupportedLanguageSchema = z
  .enum(VIBIUM_SUPPORTED_LANGUAGES)
  .default('typescript')
  .describe(
    'Target programming language: "typescript", "javascript", "python", or "java". Defaults to "typescript".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const VibiumDomainSchema = z
  .enum(['bidi', 'core', 'interactions', 'selectors', 'state'] as const)
  .describe('Supported Vibium documentation domain');

export type VibiumDomain = z.infer<typeof VibiumDomainSchema>;

export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: SupportedLanguage = 'typescript'
): Promise<string> {
  return loadCachedReferenceMarkdown(importMetaUrl, language, 'typescript');
}

export async function readVibiumReferenceDoc(
  domain: string,
  language: string = 'typescript'
): Promise<string> {
  const safeDomain = VibiumDomainSchema.parse((domain || '').toLowerCase().trim());
  const normLang = resolveLanguage(language, VIBIUM_SUPPORTED_LANGUAGES, 'typescript', 'Vibium');
  const baseUrl = new URL(`./${safeDomain}/index.js`, import.meta.url).href;
  return loadReferenceMarkdown(baseUrl, normLang);
}
