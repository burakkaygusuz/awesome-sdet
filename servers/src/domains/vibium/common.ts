import { z } from 'zod';
import { createFrameworkLoader, createFrameworkReader } from '../shared.js';
import { FRAMEWORK_REGISTRY } from '../../registry.js';

const { languages, domains, defaultDomain, defaultLanguage } = FRAMEWORK_REGISTRY.vibium;

export const VIBIUM_SUPPORTED_LANGUAGES = languages;
export const VIBIUM_DOMAINS = domains;

export const SupportedLanguageSchema = z
  .enum(VIBIUM_SUPPORTED_LANGUAGES)
  .default(defaultLanguage)
  .describe(
    'Target programming language: "typescript", "javascript", "python", or "java". Defaults to "typescript".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const VibiumDomainSchema = z
  .enum(VIBIUM_DOMAINS)
  .describe('Supported Vibium documentation domain');

export type VibiumDomain = z.infer<typeof VibiumDomainSchema>;

export const loadReferenceMarkdown = createFrameworkLoader(
  VIBIUM_SUPPORTED_LANGUAGES,
  defaultLanguage
);

export const readVibiumReferenceDoc = createFrameworkReader(
  'Vibium',
  VIBIUM_DOMAINS,
  VIBIUM_SUPPORTED_LANGUAGES,
  defaultDomain,
  defaultLanguage,
  import.meta.url
);
