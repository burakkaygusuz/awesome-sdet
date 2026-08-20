import { z } from 'zod';
import { createFrameworkReader } from '../shared.js';
import { FRAMEWORK_REGISTRY } from '../../registry.js';

const { languages, domains, defaultDomain, defaultLanguage } = FRAMEWORK_REGISTRY.selenium;

export const SELENIUM_SUPPORTED_LANGUAGES = languages;
export const SELENIUM_DOMAINS = domains;

export const SupportedLanguageSchema = z
  .enum(SELENIUM_SUPPORTED_LANGUAGES)
  .default(defaultLanguage)
  .describe(
    'Target programming language: "java", "python", "typescript", "javascript", "csharp", or "ruby". Defaults to "java".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const SeleniumDomainSchema = z
  .enum(SELENIUM_DOMAINS)
  .describe('Supported Selenium documentation domain');

export type SeleniumDomain = z.infer<typeof SeleniumDomainSchema>;

export const readSeleniumReferenceDoc = createFrameworkReader(
  'Selenium',
  SELENIUM_DOMAINS,
  SELENIUM_SUPPORTED_LANGUAGES,
  defaultDomain,
  defaultLanguage,
  import.meta.url
);
