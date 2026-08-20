import { z } from 'zod';
import { createFrameworkReader } from '../shared.js';
import { FRAMEWORK_REGISTRY } from '../../registry.js';

const { languages, domains, defaultDomain, defaultLanguage } = FRAMEWORK_REGISTRY.appium;

export const APPIUM_SUPPORTED_LANGUAGES = languages;
export const APPIUM_DOMAINS = domains;

export const SupportedLanguageSchema = z
  .enum(APPIUM_SUPPORTED_LANGUAGES)
  .default(defaultLanguage)
  .describe(
    'Target programming language: "typescript", "javascript", "python", "java", or "csharp". Defaults to "typescript".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const AppiumDomainSchema = z
  .enum(APPIUM_DOMAINS)
  .describe('Supported Appium documentation domain');

export type AppiumDomain = z.infer<typeof AppiumDomainSchema>;

export const readAppiumReferenceDoc = createFrameworkReader(
  'Appium',
  APPIUM_DOMAINS,
  APPIUM_SUPPORTED_LANGUAGES,
  defaultDomain,
  defaultLanguage,
  import.meta.url
);
