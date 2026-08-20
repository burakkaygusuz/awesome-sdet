import type { VerificationCheck } from '../schemas.js';

const BRITTLE_LOCATOR_PATTERNS: RegExp[] = [
  /\/\/(?:html|body)/i,
  /\/(?:html|body)\//i,
  /\/\/(?:html|body|div|table|tbody|tr|td|span|ul|li|p|section|article|main|header|footer)\[\d+\]/i,
  /\/\/[a-zA-Z0-9_-]+\[\d+\](?:\/[a-zA-Z0-9_-]+\[\d+\])+/i,
  /(?:locator|By\.xpath|cy\.xpath|xpath)\(['"](?:\/|\/\/)[^'"]*\[\d+\][^'"]*['"]\)/i,
  /(?:locator|By\.xpath|cy\.xpath)\(['"](?:\/|\/\/)(?:html|body)/i,
  /cy\.xpath\(['"]\/\//i,
];

const SUGGESTIONS: Record<string, string> = {
  playwright:
    'Replace brittle XPath/DOM index paths with accessible locators (e.g. getByRole, getByLabel, getByText, or getByTestId).',
  cypress:
    'Replace brittle XPath/DOM index paths with accessible locators (e.g. cy.findByRole or cy.get("[data-testid=...]")).',
  selenium:
    'Replace brittle XPath/DOM index paths with semantic locators (e.g. By.id, By.name, or By.cssSelector("[data-testid=...]")).',
  appium:
    'Replace brittle XPath/DOM index paths with accessible locators (e.g. AppiumBy.accessibilityId or semantic selectors).',
  vibium:
    'Replace brittle XPath/DOM index paths with accessible semantic locators (e.g. vibium.findByRole or semantic selectors).',
};

export function checkLocators(code: string, framework: string): VerificationCheck {
  for (const pattern of BRITTLE_LOCATOR_PATTERNS) {
    const match = pattern.exec(code);
    if (match) {
      return {
        id: 'resilient-accessibility-locators',
        rule: 'Anchor element targets to accessible semantics (role, label, test ID) rather than brittle DOM paths',
        passed: false,
        severity: 'error',
        evidence: match[0],
        suggestion:
          SUGGESTIONS[framework] ??
          'Replace brittle XPath/DOM index paths with accessible locators (e.g. getByRole, getByLabel, or By.name).',
      };
    }
  }

  return {
    id: 'resilient-accessibility-locators',
    rule: 'Anchor element targets to accessible semantics (role, label, test ID) rather than brittle DOM paths',
    passed: true,
    severity: 'error',
  };
}
