export const FRAMEWORK_IDS = ['selenium', 'cypress', 'vibium', 'appium', 'playwright'] as const;

export type SupportedFramework = (typeof FRAMEWORK_IDS)[number];

export const SUPPORTED_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'java',
  'csharp',
  'ruby',
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const SELENIUM_DOMAINS = [
  'actions',
  'bidi',
  'grid',
  'listeners',
  'locators',
  'observability',
  'pagefactory',
] as const;

export const CYPRESS_DOMAINS = [
  'commands',
  'component',
  'fixtures',
  'network',
  'session',
  'shadow',
  'stubs',
  'task',
] as const;

export const VIBIUM_DOMAINS = ['bidi', 'core', 'interactions', 'selectors', 'state'] as const;

export const APPIUM_DOMAINS = [
  'capabilities',
  'context',
  'device',
  'gestures',
  'locators',
] as const;

export const PLAYWRIGHT_DOMAINS = [
  'actions',
  'assertions',
  'locators',
  'network',
  'observability',
  'storage',
] as const;

export interface FrameworkDefinition {
  readonly toolPrefix: string;
  readonly domains: readonly string[];
  readonly languages: readonly SupportedLanguage[];
  readonly toolNames: readonly string[];
  readonly defaultDomain: string;
  readonly defaultLanguage: SupportedLanguage;
}

export const FRAMEWORK_REGISTRY = {
  selenium: {
    toolPrefix: 'se',
    domains: SELENIUM_DOMAINS,
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp', 'ruby'] as const,
    toolNames: ['read_se_docs'],
    defaultDomain: 'actions',
    defaultLanguage: 'java',
  },
  cypress: {
    toolPrefix: 'cy',
    domains: CYPRESS_DOMAINS,
    languages: ['typescript', 'javascript'] as const,
    toolNames: ['read_cy_docs'],
    defaultDomain: 'commands',
    defaultLanguage: 'typescript',
  },
  vibium: {
    toolPrefix: 'vibium',
    domains: VIBIUM_DOMAINS,
    languages: ['typescript', 'javascript', 'python', 'java'] as const,
    toolNames: ['read_vibium_docs'],
    defaultDomain: 'core',
    defaultLanguage: 'typescript',
  },
  appium: {
    toolPrefix: 'appium',
    domains: APPIUM_DOMAINS,
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp'] as const,
    toolNames: ['read_appium_docs'],
    defaultDomain: 'capabilities',
    defaultLanguage: 'typescript',
  },
  playwright: {
    toolPrefix: 'pw',
    domains: PLAYWRIGHT_DOMAINS,
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp'] as const,
    toolNames: ['read_pw_docs'],
    defaultDomain: 'locators',
    defaultLanguage: 'typescript',
  },
} satisfies Record<SupportedFramework, FrameworkDefinition>;
