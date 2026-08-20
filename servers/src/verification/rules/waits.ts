import type { VerificationCheck } from '../schemas.js';

const WAIT_PATTERNS: Record<string, RegExp[]> = {
  playwright: [
    /waitForTimeout\s*\(/i,
    /page\.wait\s*\(/i,
    /time\.sleep\s*\(/i,
    /Thread\.sleep\s*\(/i,
  ],
  selenium: [
    /Thread\.sleep\s*\(/i,
    /Thread\.Sleep\s*\(/i,
    /time\.sleep\s*\(/i,
    /sleep\s*\(\s*\d+\s*\)/i,
    /sleep\s*\(/i,
    /Task\.Delay\s*\(/i,
  ],
  cypress: [/cy\.wait\s*\(\s*\d+\s*\)/i],
  vibium: [/sleep\s*\(/i, /waitForTimeout\s*\(/i, /time\.sleep\s*\(/i, /Thread\.sleep\s*\(/i],
  appium: [
    /Thread\.sleep\s*\(/i,
    /Thread\.Sleep\s*\(/i,
    /time\.sleep\s*\(/i,
    /sleep\s*\(\s*\d+\s*\)/i,
    /sleep\s*\(/i,
    /Task\.Delay\s*\(/i,
  ],
};

const DEFAULT_WAIT_PATTERNS: RegExp[] = [
  /waitForTimeout\s*\(/i,
  /cy\.wait\s*\(\s*\d+\s*\)/i,
  /Thread\.sleep\s*\(/i,
  /time\.sleep\s*\(/i,
  /sleep\s*\(/i,
];

export function checkArbitraryWaits(code: string, framework: string): VerificationCheck {
  const patterns = WAIT_PATTERNS[framework] ?? DEFAULT_WAIT_PATTERNS;
  for (const pattern of patterns) {
    const match = pattern.exec(code);
    if (match) {
      return {
        id: 'no-arbitrary-waits',
        rule: 'Synchronize strictly on condition waiters and auto-waiting assertions instead of arbitrary time delays',
        passed: false,
        severity: 'error',
        evidence: match[0],
        suggestion:
          'Replace arbitrary sleep with framework-native dynamic condition waiter (e.g. expect(locator).toBeVisible()).',
      };
    }
  }

  return {
    id: 'no-arbitrary-waits',
    rule: 'Synchronize strictly on condition waiters and auto-waiting assertions instead of arbitrary time delays',
    passed: true,
    severity: 'error',
  };
}
