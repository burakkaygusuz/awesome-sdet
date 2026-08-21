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
  readonly domains: readonly string[];
  readonly languages: readonly SupportedLanguage[];
  readonly defaultDomain: string;
  readonly defaultLanguage: SupportedLanguage;
}

export const FRAMEWORK_REGISTRY = {
  selenium: {
    domains: SELENIUM_DOMAINS,
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp', 'ruby'] as const,
    defaultDomain: 'actions',
    defaultLanguage: 'java',
  },
  cypress: {
    domains: CYPRESS_DOMAINS,
    languages: ['typescript', 'javascript'] as const,
    defaultDomain: 'commands',
    defaultLanguage: 'typescript',
  },
  vibium: {
    domains: VIBIUM_DOMAINS,
    languages: ['typescript', 'javascript', 'python', 'java'] as const,
    defaultDomain: 'core',
    defaultLanguage: 'typescript',
  },
  appium: {
    domains: APPIUM_DOMAINS,
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp'] as const,
    defaultDomain: 'capabilities',
    defaultLanguage: 'typescript',
  },
  playwright: {
    domains: PLAYWRIGHT_DOMAINS,
    languages: ['typescript', 'javascript', 'python', 'java', 'csharp'] as const,
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

interface FrameworkSignatureGroup {
  readonly primary: readonly RegExp[];
  readonly secondary: readonly RegExp[];
  readonly context: readonly RegExp[];
}

const ROUTING_WEIGHTS = {
  primary: 5,
  secondary: 2,
  context: 1,
} as const;

export const FRAMEWORK_ROUTING_SIGNATURES: Readonly<
  Record<SupportedFramework, FrameworkSignatureGroup>
> = Object.freeze({
  playwright: Object.freeze({
    primary: Object.freeze([
      /\bplaywright\b/i,
      /\b@playwright\/test\b/i,
      /\bplaywright\.config\b/i,
      /\bpw\b/i,
    ]),
    secondary: Object.freeze([
      /\bpage\.(?:getByRole|getByLabel|getByText|getByTestId|getByPlaceholder|getByAltText|getByTitle|locator|goto|waitForURL|route|unroute)\b/i,
      /\bexpect\s*\(\s*(?:page|locator)\b/i,
      /\bbrowserContext\b/i,
    ]),
    context: Object.freeze([/\btrace\.playwright\.dev\b/i, /\bplaywright\s+codegen\b/i]),
  }),
  selenium: Object.freeze({
    primary: Object.freeze([
      /\bselenium(?:\s*4)?\b/i,
      /\bwebdriver\b/i,
      /\bremotewebdriver\b/i,
      /\bselenium\s+grid\b/i,
    ]),
    secondary: Object.freeze([
      /\bchromedriver\b/i,
      /\bgeckodriver\b/i,
      /\bedgedriver\b/i,
      /\bBy\.(?:id|name|xpath|cssSelector|className|tagName|linkText)\b/i,
      /\bWebDriverWait\b/i,
      /\bPageFactory\b/i,
      /\bThreadLocal<WebDriver>\b/i,
    ]),
    context: Object.freeze([/\bchromeoptions\b/i, /\bw3c\s+webdriver\b/i]),
  }),
  cypress: Object.freeze({
    primary: Object.freeze([/\bcypress\b/i, /\bcypress\.config\b/i]),
    secondary: Object.freeze([
      /\bcy\.(?:visit|get|contains|intercept|origin|session|mount|request|wrap|fixture|wait|xpath)\b/i,
    ]),
    context: Object.freeze([/\be2e\s+support\s+files\b/i, /\bcypress\s+studio\b/i]),
  }),
  vibium: Object.freeze({
    primary: Object.freeze([/\bvibium\b/i, /\bsense-think-act\b/i]),
    secondary: Object.freeze([/\bvibium\.(?:find|findByRole|click|type)\b/i]),
    context: Object.freeze([/\bvisual\s+snapshot\s+diffing\b/i, /\bai-assisted\s+element\b/i]),
  }),
  appium: Object.freeze({
    primary: Object.freeze([/\bappium\b/i, /\bAppiumBy\b/i, /\bUiAutomator2\b/i, /\bXCUITest\b/i]),
    secondary: Object.freeze([
      /\bAndroidDriver\b/i,
      /\bIOSDriver\b/i,
      /\bAppiumDriver\b/i,
      /\baccessibilityId\b/i,
      /\bThreadLocal<(?:AppiumDriver|AndroidDriver|IOSDriver)>\b/i,
    ]),
    context: Object.freeze([
      /\bnative_app\b/i,
      /\bwebview\s+contexts\b/i,
      /\bmobile\s+touch\s+action\b/i,
    ]),
  }),
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
    const signatureGroup = FRAMEWORK_ROUTING_SIGNATURES[framework];
    const matchedKeywords: string[] = [];
    let score = 0;

    for (const signature of signatureGroup.primary) {
      const match = signature.exec(query);
      if (match) {
        matchedKeywords.push(match[0]);
        score += ROUTING_WEIGHTS.primary;
      }
    }

    for (const signature of signatureGroup.secondary) {
      const match = signature.exec(query);
      if (match) {
        matchedKeywords.push(match[0]);
        score += ROUTING_WEIGHTS.secondary;
      }
    }

    for (const signature of signatureGroup.context) {
      const match = signature.exec(query);
      if (match) {
        matchedKeywords.push(match[0]);
        score += ROUTING_WEIGHTS.context;
      }
    }

    if (matchedKeywords.length > 0) {
      results.push({ framework, matchedKeywords, score });
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
