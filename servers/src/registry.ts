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

export interface FrameworkDefinition {
  readonly toolPrefix: string;
  readonly resourceUri: string;
  readonly domains: readonly string[];
  readonly languages: readonly SupportedLanguage[];
  readonly toolNames: readonly string[];
}

export const FRAMEWORK_REGISTRY = {
  selenium: {
    toolPrefix: 'se',
    resourceUri: 'selenium://{domain}/{language}',
    domains: ['actions', 'bidi', 'grid', 'listeners', 'locators', 'observability', 'pagefactory'],
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp', 'ruby'],
    toolNames: ['read_se_docs'],
  },
  cypress: {
    toolPrefix: 'cy',
    resourceUri: 'cypress://{domain}/{language}',
    domains: ['commands', 'component', 'fixtures', 'network', 'session', 'shadow', 'stubs', 'task'],
    languages: ['typescript', 'javascript'],
    toolNames: ['read_cy_docs'],
  },
  vibium: {
    toolPrefix: 'vibium',
    resourceUri: 'vibium://{domain}/{language}',
    domains: ['bidi', 'core', 'interactions', 'selectors', 'state'],
    languages: ['typescript', 'javascript', 'python', 'java'],
    toolNames: ['read_vibium_docs'],
  },
  appium: {
    toolPrefix: 'appium',
    resourceUri: 'appium://{domain}/{language}',
    domains: ['capabilities', 'context', 'device', 'gestures', 'locators'],
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp'],
    toolNames: ['read_appium_docs'],
  },
  playwright: {
    toolPrefix: 'pw',
    resourceUri: 'playwright://{domain}/{language}',
    domains: ['actions', 'assertions', 'locators', 'network', 'observability', 'storage'],
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp'],
    toolNames: ['read_pw_docs'],
  },
} satisfies Record<SupportedFramework, FrameworkDefinition>;
