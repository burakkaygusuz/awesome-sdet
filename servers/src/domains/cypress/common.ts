import { z } from 'zod';
import { createFrameworkLoader, createFrameworkReader } from '../shared.js';
import { FRAMEWORK_REGISTRY } from '../../registry.js';

const { languages, domains, defaultDomain, defaultLanguage } = FRAMEWORK_REGISTRY.cypress;

export const CYPRESS_SUPPORTED_LANGUAGES = languages;
export const CYPRESS_DOMAINS = domains;

export const SupportedLanguageSchema = z
  .enum(CYPRESS_SUPPORTED_LANGUAGES)
  .default(defaultLanguage)
  .describe('Target programming language: "javascript" or "typescript". Defaults to "typescript".');

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const CypressDomainSchema = z
  .enum(CYPRESS_DOMAINS)
  .describe('Supported Cypress documentation domain');

export type CypressDomain = z.infer<typeof CypressDomainSchema>;

export const loadReferenceMarkdown = createFrameworkLoader(
  CYPRESS_SUPPORTED_LANGUAGES,
  defaultLanguage
);

export const readCypressReferenceDoc = createFrameworkReader(
  'Cypress',
  CYPRESS_DOMAINS,
  CYPRESS_SUPPORTED_LANGUAGES,
  defaultDomain,
  defaultLanguage,
  import.meta.url
);
