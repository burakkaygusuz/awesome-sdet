import { z } from 'zod';
import { loadCachedReferenceMarkdown, resolveLanguage } from '../shared.js';

export const CYPRESS_SUPPORTED_LANGUAGES = ['javascript', 'typescript'] as const;

export const SupportedLanguageSchema = z
  .enum(CYPRESS_SUPPORTED_LANGUAGES)
  .default('typescript')
  .describe('Target programming language: "javascript" or "typescript". Defaults to "typescript".');

export type CypressSupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const CypressDomainSchema = z
  .enum([
    'commands',
    'component',
    'fixtures',
    'network',
    'session',
    'shadow',
    'stubs',
    'task',
  ] as const)
  .describe('Supported Cypress documentation domain');

export type CypressDomain = z.infer<typeof CypressDomainSchema>;

export async function readCypressReferenceDoc(
  domain: string,
  language: string = 'typescript'
): Promise<string> {
  const safeDomain = CypressDomainSchema.parse((domain || '').toLowerCase().trim());
  const langFile = resolveLanguage(language, CYPRESS_SUPPORTED_LANGUAGES, 'typescript', 'Cypress');
  const baseUrl = new URL(`./${safeDomain}/index.js`, import.meta.url).href;
  return loadCachedReferenceMarkdown(baseUrl, langFile, 'typescript');
}
