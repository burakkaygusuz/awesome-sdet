import { z } from 'zod';
import { createFrameworkLoader, createFrameworkReader } from '../shared.js';
import { FRAMEWORK_REGISTRY } from '../../registry.js';

const { languages, domains, defaultDomain, defaultLanguage } = FRAMEWORK_REGISTRY.playwright;

export const PLAYWRIGHT_SUPPORTED_LANGUAGES = languages;
export const PLAYWRIGHT_DOMAINS = domains;

export const SupportedLanguageSchema = z
  .enum(PLAYWRIGHT_SUPPORTED_LANGUAGES)
  .default(defaultLanguage)
  .describe(
    'Target programming language: "typescript", "javascript", "python", "java", or "csharp". Defaults to "typescript".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const PlaywrightDomainSchema = z
  .enum(PLAYWRIGHT_DOMAINS)
  .describe('Supported Playwright documentation domain');

export type PlaywrightDomain = z.infer<typeof PlaywrightDomainSchema>;

export const loadReferenceMarkdown = createFrameworkLoader(
  PLAYWRIGHT_SUPPORTED_LANGUAGES,
  defaultLanguage
);

export const readPlaywrightReferenceDoc = createFrameworkReader(
  'Playwright',
  PLAYWRIGHT_DOMAINS,
  PLAYWRIGHT_SUPPORTED_LANGUAGES,
  defaultDomain,
  defaultLanguage,
  import.meta.url
);
