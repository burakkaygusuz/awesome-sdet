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

export type FrameworkRoutingMatch =
  | {
      readonly status: 'matched';
      readonly framework: SupportedFramework;
      readonly candidates: readonly [SupportedFramework];
      readonly matchedKeywords: readonly string[];
      readonly score: number;
    }
  | {
      readonly status: 'ambiguous';
      readonly framework: null;
      readonly candidates: readonly SupportedFramework[];
      readonly matchedKeywords: readonly string[];
      readonly score: number;
    };

export const FRAMEWORK_ROUTING_SIGNATURES: Readonly<Record<SupportedFramework, readonly RegExp[]>> =
  Object.freeze({
    playwright: Object.freeze([
      /\bplaywright\b/i,
      /\b@playwright\/test\b/i,
      /\bread_pw_docs\b/i,
      /\bpage\.(?:getByRole|getByLabel|getByText|getByTestId|getByPlaceholder|getByAltText|getByTitle|locator|goto|waitForURL|route|unroute)\b/i,
      /\bexpect\s*\(\s*(?:page|locator)\b/i,
      /\bbrowserContext\b/i,
      /\bplaywright\.config\b/i,
    ]),
    selenium: Object.freeze([
      /\bselenium\b/i,
      /\bread_se_docs\b/i,
      /\bwebdriver\b/i,
      /\bremotewebdriver\b/i,
      /\bchromedriver\b/i,
      /\bgeckodriver\b/i,
      /\bedgedriver\b/i,
      /\bselenium\s+grid\b/i,
      /\bBy\.(?:id|name|xpath|cssSelector|className|tagName|linkText)\b/i,
      /\bWebDriverWait\b/i,
      /\bPageFactory\b/i,
      /\bThreadLocal<WebDriver>\b/i,
    ]),
    cypress: Object.freeze([
      /\bcypress\b/i,
      /\bread_cy_docs\b/i,
      /\bcy\.(?:visit|get|contains|intercept|origin|session|mount|request|wrap|fixture|wait|xpath)\b/i,
      /\bcypress\.config\b/i,
    ]),
    vibium: Object.freeze([
      /\bvibium\b/i,
      /\bread_vibium_docs\b/i,
      /\bsense-think-act\b/i,
      /\bvibium\.(?:find|findByRole|click|type)\b/i,
    ]),
    appium: Object.freeze([
      /\bappium\b/i,
      /\bread_appium_docs\b/i,
      /\bAppiumBy\b/i,
      /\bAndroidDriver\b/i,
      /\bIOSDriver\b/i,
      /\bAppiumDriver\b/i,
      /\bUiAutomator2\b/i,
      /\bXCUITest\b/i,
      /\baccessibilityId\b/i,
      /\bThreadLocal<AppiumDriver>\b/i,
      /\bThreadLocal<AndroidDriver>\b/i,
      /\bThreadLocal<IOSDriver>\b/i,
    ]),
  });

export function routeFrameworkQuery(query: string): FrameworkRoutingMatch | null {
  if (!query || typeof query !== 'string') {
    return null;
  }

  const results: Array<{
    framework: SupportedFramework;
    matchedKeywords: string[];
    score: number;
  }> = [];

  for (const framework of FRAMEWORK_IDS) {
    const signatures = FRAMEWORK_ROUTING_SIGNATURES[framework];
    const matchedKeywords: string[] = [];

    for (const signature of signatures) {
      const match = signature.exec(query);
      if (match) {
        matchedKeywords.push(match[0]);
      }
    }

    if (matchedKeywords.length > 0) {
      results.push({
        framework,
        matchedKeywords,
        score: matchedKeywords.length,
      });
    }
  }

  if (results.length === 0) {
    return null;
  }

  results.sort((a, b) => b.score - a.score);
  const highestScore = results[0].score;
  const topMatches = results.filter((r) => r.score === highestScore);

  if (topMatches.length === 1) {
    return {
      framework: topMatches[0].framework,
      status: 'matched',
      candidates: [topMatches[0].framework],
      matchedKeywords: topMatches[0].matchedKeywords,
      score: topMatches[0].score,
    };
  }

  // Multiple frameworks tied on highest score -> Ambiguous match
  const allTiedKeywords = topMatches.flatMap((m) => m.matchedKeywords);
  const candidateFrameworks = topMatches.map((m) => m.framework);

  return {
    framework: null,
    status: 'ambiguous',
    candidates: candidateFrameworks,
    matchedKeywords: allTiedKeywords,
    score: highestScore,
  };
}
