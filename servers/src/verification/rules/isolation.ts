import type { VerificationCheck } from '../schemas.js';

const STATE_ISOLATION_PATTERNS: RegExp[] = [
  /(?:(?:public|protected|private)\s+)?static\s+(?!ThreadLocal)(?:WebDriver|RemoteWebDriver|ChromeDriver|FirefoxDriver|EdgeDriver|SafariDriver|AppiumDriver|AndroidDriver|IOSDriver|Page|BrowserContext)\s+[a-zA-Z0-9_$]+/i,
  /global\s+driver\b/i,
  /static\s+(?:driver|page)\s*:\s*(?:WebDriver|Page)\b/i,
];

const SUGGESTIONS: Record<string, string> = {
  selenium:
    'Use ThreadLocal<WebDriver> or per-test driver instantiation to prevent shared mutable state in parallel runs.',
  appium:
    'Use ThreadLocal<AppiumDriver> or per-test driver instantiation to prevent shared mutable state in parallel runs.',
  playwright:
    'Use test fixture-scoped page/context ({ page }) instead of static or global page instances.',
  cypress:
    'Use beforeEach lifecycle hooks or isolated cy.session() instead of global mutable test state.',
  vibium: 'Use test-scoped session instances instead of global mutable state.',
};

export function checkStateIsolation(code: string, framework: string): VerificationCheck {
  for (const pattern of STATE_ISOLATION_PATTERNS) {
    const match = pattern.exec(code);
    if (match) {
      return {
        id: 'thread-isolated-state',
        rule: 'Driver and session instances must be thread-isolated to guarantee concurrency safety',
        passed: false,
        severity: 'error',
        evidence: match[0].trim(),
        suggestion:
          SUGGESTIONS[framework] ??
          'Use ThreadLocal<WebDriver>, fixture-scoped page/driver, or per-test driver instantiation to prevent shared mutable state in parallel runs.',
      };
    }
  }

  return {
    id: 'thread-isolated-state',
    rule: 'Driver and session instances must be thread-isolated to guarantee concurrency safety',
    passed: true,
    severity: 'error',
  };
}
