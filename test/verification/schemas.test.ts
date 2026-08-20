import { describe, expect, it } from 'vitest';

import { FRAMEWORK_IDS, SUPPORTED_LANGUAGES } from '../../servers/src/registry.js';
import {
  VERIFICATION_SEVERITIES,
  VerificationCheckSchema,
  VerificationRequestSchema,
  VerificationResultSchema,
  type VerificationCheck,
  type VerificationRequest,
  type VerificationResult,
} from '../../servers/src/verification/schemas.js';

describe('Verification Schemas', () => {
  describe('VerificationRequestSchema', () => {
    it('accepts valid VerificationRequest with all fields', () => {
      const validPayload: VerificationRequest = {
        code: 'import { test, expect } from "@playwright/test";\ntest("valid", async ({ page }) => {});',
        framework: 'playwright',
        language: 'typescript',
        context: 'user login authentication spec',
      };

      const parsed = VerificationRequestSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toEqual(validPayload);
      }
    });

    it('accepts valid VerificationRequest with minimal required fields', () => {
      const minimalPayload = {
        code: 'cy.visit("/login"); cy.get("#submit").click();',
        framework: 'cypress',
      };

      const parsed = VerificationRequestSchema.safeParse(minimalPayload);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.code).toBe(minimalPayload.code);
        expect(parsed.data.framework).toBe('cypress');
        expect(parsed.data.language).toBeUndefined();
        expect(parsed.data.context).toBeUndefined();
      }
    });

    it('accepts all registered FRAMEWORK_IDS', () => {
      for (const framework of FRAMEWORK_IDS) {
        const payload = {
          code: '/* automation code */',
          framework,
        };
        const parsed = VerificationRequestSchema.safeParse(payload);
        expect(parsed.success).toBe(true);
      }
    });

    it('accepts all registered SUPPORTED_LANGUAGES', () => {
      for (const language of SUPPORTED_LANGUAGES) {
        const payload = {
          code: '/* automation code */',
          framework: 'playwright',
          language,
        };
        const parsed = VerificationRequestSchema.safeParse(payload);
        expect(parsed.success).toBe(true);
      }
    });

    it('rejects missing or empty code', () => {
      const missingCode = { framework: 'playwright' };
      const emptyCode = { code: '', framework: 'playwright' };

      expect(VerificationRequestSchema.safeParse(missingCode).success).toBe(false);
      expect(VerificationRequestSchema.safeParse(emptyCode).success).toBe(false);
    });

    it('rejects invalid framework', () => {
      const invalidFramework = {
        code: 'test("foo", () => {});',
        framework: 'puppeteer',
      };

      const parsed = VerificationRequestSchema.safeParse(invalidFramework);
      expect(parsed.success).toBe(false);
    });

    it('rejects invalid language', () => {
      const invalidLanguage = {
        code: 'func TestFoo(t *testing.T) {}',
        framework: 'playwright',
        language: 'golang',
      };

      const parsed = VerificationRequestSchema.safeParse(invalidLanguage);
      expect(parsed.success).toBe(false);
    });

    it('rejects unknown properties due to strict validation (.strict())', () => {
      const payloadWithExtra = {
        code: 'driver.findElement(By.id("btn")).click();',
        framework: 'selenium',
        unexpectedField: 'forbidden-property',
      };

      const parsed = VerificationRequestSchema.safeParse(payloadWithExtra);
      expect(parsed.success).toBe(false);
    });
  });

  describe('VerificationCheckSchema', () => {
    it('accepts valid VerificationCheck with all fields', () => {
      const validCheck: VerificationCheck = {
        id: 'no-arbitrary-sleep',
        rule: 'Prohibit hardcoded setTimeout or sleep calls',
        passed: false,
        severity: 'error',
        evidence: 'await page.waitForTimeout(5000)',
        suggestion: 'Replace with page.locator().waitFor() or web assertion',
      };

      const parsed = VerificationCheckSchema.safeParse(validCheck);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toEqual(validCheck);
      }
    });

    it('accepts valid VerificationCheck without optional evidence and suggestion', () => {
      const minimalCheck = {
        id: 'locator-accessible-role',
        rule: 'Enforce accessible locator strategy',
        passed: true,
        severity: 'info',
      };

      const parsed = VerificationCheckSchema.safeParse(minimalCheck);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.id).toBe('locator-accessible-role');
        expect(parsed.data.passed).toBe(true);
        expect(parsed.data.severity).toBe('info');
        expect(parsed.data.evidence).toBeUndefined();
        expect(parsed.data.suggestion).toBeUndefined();
      }
    });

    it('accepts all VERIFICATION_SEVERITIES', () => {
      for (const severity of VERIFICATION_SEVERITIES) {
        const check = {
          id: `check-${severity}`,
          rule: `Rule for ${severity}`,
          passed: true,
          severity,
        };

        const parsed = VerificationCheckSchema.safeParse(check);
        expect(parsed.success).toBe(true);
      }
    });

    it('rejects empty id or empty rule', () => {
      const emptyId = {
        id: '',
        rule: 'Non-empty rule',
        passed: true,
        severity: 'error',
      };
      const emptyRule = {
        id: 'valid-id',
        rule: '',
        passed: true,
        severity: 'error',
      };

      expect(VerificationCheckSchema.safeParse(emptyId).success).toBe(false);
      expect(VerificationCheckSchema.safeParse(emptyRule).success).toBe(false);
    });

    it('rejects invalid severity', () => {
      const invalidSeverity = {
        id: 'check-1',
        rule: 'Rule 1',
        passed: true,
        severity: 'fatal',
      };

      const parsed = VerificationCheckSchema.safeParse(invalidSeverity);
      expect(parsed.success).toBe(false);
    });

    it('rejects non-boolean passed field', () => {
      const nonBoolean = {
        id: 'check-1',
        rule: 'Rule 1',
        passed: 'true',
        severity: 'error',
      };

      const parsed = VerificationCheckSchema.safeParse(nonBoolean);
      expect(parsed.success).toBe(false);
    });

    it('rejects unknown properties due to strict validation (.strict())', () => {
      const extraProperty = {
        id: 'check-1',
        rule: 'Rule 1',
        passed: true,
        severity: 'error',
        unknownMetadata: { foo: 'bar' },
      };

      const parsed = VerificationCheckSchema.safeParse(extraProperty);
      expect(parsed.success).toBe(false);
    });
  });

  describe('VerificationResultSchema', () => {
    it('accepts valid VerificationResult with all fields', () => {
      const validResult: VerificationResult = {
        passed: false,
        score: 65,
        checks: [
          {
            id: 'no-arbitrary-sleep',
            rule: 'Prohibit hardcoded setTimeout or sleep calls',
            passed: false,
            severity: 'error',
            evidence: 'await page.waitForTimeout(5000)',
            suggestion: 'Use auto-waiting assertions',
          },
          {
            id: 'accessible-locators',
            rule: 'Use user-facing role locators',
            passed: true,
            severity: 'info',
          },
        ],
        actionableHints: [
          'Eliminate sleep on line 12 and use expect(page.getByRole("button")).toBeVisible() instead.',
        ],
      };

      const parsed = VerificationResultSchema.safeParse(validResult);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data).toEqual(validResult);
      }
    });

    it('defaults actionableHints to empty array if omitted', () => {
      const resultWithoutHints = {
        passed: true,
        score: 100,
        checks: [],
      };

      const parsed = VerificationResultSchema.safeParse(resultWithoutHints);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.passed).toBe(true);
        expect(parsed.data.score).toBe(100);
        expect(parsed.data.checks).toEqual([]);
        expect(parsed.data.actionableHints).toEqual([]);
      }
    });

    it('validates score boundaries [0, 100]', () => {
      const scoreZero = { passed: false, score: 0, checks: [], actionableHints: [] };
      const scoreHundred = { passed: true, score: 100, checks: [], actionableHints: [] };
      const scoreFloat = { passed: true, score: 87.5, checks: [], actionableHints: [] };

      expect(VerificationResultSchema.safeParse(scoreZero).success).toBe(true);
      expect(VerificationResultSchema.safeParse(scoreHundred).success).toBe(true);
      expect(VerificationResultSchema.safeParse(scoreFloat).success).toBe(true);

      const scoreBelowZero = { passed: false, score: -1, checks: [], actionableHints: [] };
      const scoreAboveHundred = { passed: false, score: 101, checks: [], actionableHints: [] };

      expect(VerificationResultSchema.safeParse(scoreBelowZero).success).toBe(false);
      expect(VerificationResultSchema.safeParse(scoreAboveHundred).success).toBe(false);
    });

    it('rejects invalid checks inside checks array', () => {
      const invalidChecksArray = {
        passed: false,
        score: 40,
        checks: [
          {
            id: '',
            rule: 'Invalid check with empty id',
            passed: false,
            severity: 'error',
          },
        ],
        actionableHints: [],
      };

      const parsed = VerificationResultSchema.safeParse(invalidChecksArray);
      expect(parsed.success).toBe(false);
    });

    it('rejects non-string items in actionableHints', () => {
      const invalidHints = {
        passed: true,
        score: 100,
        checks: [],
        actionableHints: [123],
      };

      const parsed = VerificationResultSchema.safeParse(invalidHints);
      expect(parsed.success).toBe(false);
    });

    it('rejects unknown properties due to strict validation (.strict())', () => {
      const extraPropertyResult = {
        passed: true,
        score: 100,
        checks: [],
        actionableHints: [],
        unexpectedField: 'not-allowed',
      };

      const parsed = VerificationResultSchema.safeParse(extraPropertyResult);
      expect(parsed.success).toBe(false);
    });
  });
});
