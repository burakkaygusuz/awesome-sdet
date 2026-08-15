import { z } from 'zod';
import { loadCachedReferenceMarkdown, sanitizeDomain, sanitizeLanguage } from '../shared.js';
import { FRAMEWORK_REGISTRY } from '../../registry.js';

export const CYPRESS_SUPPORTED_LANGUAGES = FRAMEWORK_REGISTRY.cypress.languages;

export const SupportedLanguageSchema = z
  .enum(CYPRESS_SUPPORTED_LANGUAGES)
  .default('typescript')
  .describe('Target programming language: "javascript" or "typescript". Defaults to "typescript".');

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const CYPRESS_DOMAINS = FRAMEWORK_REGISTRY.cypress.domains;

export const CypressDomainSchema = z
  .enum(CYPRESS_DOMAINS)
  .describe('Supported Cypress documentation domain');

export type CypressDomain = z.infer<typeof CypressDomainSchema>;

export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: string = 'typescript'
): Promise<string> {
  const safeLang = sanitizeLanguage(language, CYPRESS_SUPPORTED_LANGUAGES, 'typescript');
  return loadCachedReferenceMarkdown(importMetaUrl, safeLang);
}

export async function readCypressReferenceDoc(
  domain: string,
  language: string = 'typescript'
): Promise<string> {
  const safeDomain = sanitizeDomain(domain, CYPRESS_DOMAINS, 'commands', 'Cypress');
  const langFile = sanitizeLanguage(language, CYPRESS_SUPPORTED_LANGUAGES, 'typescript', 'Cypress');
  const baseUrl = new URL(`./${safeDomain}/index.js`, import.meta.url).href;
  return loadReferenceMarkdown(baseUrl, langFile);
}
