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
    toolNames: [
      'execute_se_explicit_wait',
      'read_se_pagefactory_docs',
      'read_se_locator_docs',
      'read_se_bidi_docs',
      'read_se_actions_docs',
      'read_se_listeners_docs',
      'read_se_grid_docs',
      'read_se_observability_docs',
    ],
  },
  cypress: {
    toolPrefix: 'cy',
    resourceUri: 'cypress://{domain}/{language}',
    domains: ['commands', 'component', 'fixtures', 'network', 'session', 'shadow', 'stubs', 'task'],
    languages: ['typescript', 'javascript'],
    toolNames: [
      'read_cy_commands_docs',
      'read_cy_network_docs',
      'read_cy_session_docs',
      'read_cy_shadow_docs',
      'read_cy_component_docs',
      'read_cy_task_docs',
      'read_cy_stubs_spies_docs',
      'read_cy_fixtures_docs',
    ],
  },
  vibium: {
    toolPrefix: 'vibium',
    resourceUri: 'vibium://{domain}/{language}',
    domains: ['bidi', 'core', 'interactions', 'selectors', 'state'],
    languages: ['typescript', 'javascript', 'python', 'java'],
    toolNames: [
      'read_vibium_core_docs',
      'read_vibium_selectors_docs',
      'read_vibium_interactions_docs',
      'read_vibium_bidi_docs',
      'read_vibium_state_docs',
    ],
  },
  appium: {
    toolPrefix: 'appium',
    resourceUri: 'appium://{domain}/{language}',
    domains: ['capabilities', 'context', 'device', 'gestures', 'locators'],
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp'],
    toolNames: [
      'read_appium_capabilities_docs',
      'read_appium_locators_docs',
      'read_appium_gestures_docs',
      'read_appium_context_docs',
      'read_appium_device_docs',
    ],
  },
  playwright: {
    toolPrefix: 'pw',
    resourceUri: 'playwright://{domain}/{language}',
    domains: ['actions', 'assertions', 'locators', 'network', 'observability', 'storage'],
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp'],
    toolNames: [
      'read_pw_locators_docs',
      'read_pw_actions_docs',
      'read_pw_assertions_docs',
      'read_pw_network_docs',
      'read_pw_storage_docs',
      'read_pw_observability_docs',
    ],
  },
} satisfies Record<SupportedFramework, FrameworkDefinition>;
