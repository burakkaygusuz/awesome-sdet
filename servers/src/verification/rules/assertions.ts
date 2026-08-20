import type { VerificationCheck } from '../schemas.js';

const ASSERTION_PATTERNS: Record<string, RegExp[]> = {
  playwright: [/expect\s*\(.+?\)\./i, /expect\s*\(/i, /assert\./i, /assert\s+/i],
  selenium: [
    /Assert\./i,
    /Assert\s+/i,
    /assertThat\s*\(/i,
    /expect\s*\(/i,
    /self\.assert/i,
    /assert\s+/i,
  ],
  cypress: [
    /cy\.get\(.+?\)\.should\s*\(/i,
    /cy\.contains\(.+?\)\.should\s*\(/i,
    /\.should\s*\(/i,
    /\.and\s*\(/i,
    /expect\s*\(.+?\)\./i,
    /expect\s*\(/i,
    /assert\./i,
    /assert\s+/i,
  ],
  vibium: [/expect\s*\(.+?\)\./i, /expect\s*\(/i, /assert\./i, /assert\s+/i],
  appium: [
    /Assert\./i,
    /Assert\s+/i,
    /assertThat\s*\(/i,
    /expect\s*\(/i,
    /self\.assert/i,
    /assert\s+/i,
  ],
};

const DEFAULT_ASSERTION_PATTERNS: RegExp[] = [
  /expect\s*\(/i,
  /Assert\./i,
  /assertThat\s*\(/i,
  /self\.assert/i,
  /assert\s+/i,
  /\.should\s*\(/i,
];

const SUGGESTIONS: Record<string, string> = {
  playwright:
    'Add explicit assertions (e.g. expect(locator).toBeVisible() or expect(locator).toHaveText(...)) to verify expected outcome.',
  cypress:
    "Add explicit assertions (e.g. cy.get(...).should('be.visible') or expect(...)) to verify expected outcome.",
  selenium:
    'Add explicit assertions (e.g. Assert.assertEquals(...) or assertThat(...).isEqualTo(...)) to verify expected outcome.',
  appium:
    'Add explicit assertions (e.g. Assert.assertTrue(...) or assertThat(...).isTrue()) to verify expected outcome.',
  vibium:
    'Add explicit assertions (e.g. await expect(locator).toHaveText(...)) to verify expected outcome.',
};

export function checkAssertions(code: string, framework: string): VerificationCheck {
  const patterns = ASSERTION_PATTERNS[framework] ?? DEFAULT_ASSERTION_PATTERNS;
  const hasAssertion = patterns.some((p) => p.test(code));

  if (!hasAssertion) {
    return {
      id: 'meaningful-assertions',
      rule: 'Test scenarios must contain explicit, meaningful business assertions',
      passed: false,
      severity: 'error',
      suggestion:
        SUGGESTIONS[framework] ??
        'Add explicit assertions (e.g. expect(locator).toHaveText(...)) to verify expected outcome.',
    };
  }

  return {
    id: 'meaningful-assertions',
    rule: 'Test scenarios must contain explicit, meaningful business assertions',
    passed: true,
    severity: 'error',
  };
}
