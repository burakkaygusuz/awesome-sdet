import { describe, expect, it } from 'vitest';

import { FRAMEWORK_IDS, SUPPORTED_LANGUAGES } from '../../servers/src/registry.js';
import { DocsGatewayInputSchema } from '../../servers/src/tools/docs-gateway.js';
import {
  VERIFICATION_SEVERITIES,
  VerificationCheckSchema,
  VerificationRequestSchema,
  VerificationResultSchema,
} from '../../servers/src/verification/schemas.js';

describe('Server Domain Schemas', () => {
  describe('DocsGatewayInputSchema', () => {
    it('validates valid requests with optional params', () => {
      const parsed = DocsGatewayInputSchema.safeParse({
        framework: 'playwright',
        domain: 'locators',
        language: 'typescript',
        query: 'getByRole',
      });
      expect(parsed.success).toBe(true);

      const minimal = DocsGatewayInputSchema.safeParse({
        framework: 'cypress',
        domain: 'commands',
      });
      expect(minimal.success).toBe(true);
    });

    it('accepts all registered FRAMEWORK_IDS and SUPPORTED_LANGUAGES', () => {
      for (const framework of FRAMEWORK_IDS) {
        expect(DocsGatewayInputSchema.safeParse({ framework, domain: 'actions' }).success).toBe(
          true
        );
      }
      for (const language of SUPPORTED_LANGUAGES) {
        expect(
          DocsGatewayInputSchema.safeParse({
            framework: 'playwright',
            domain: 'locators',
            language,
          }).success
        ).toBe(true);
      }
    });

    it('rejects invalid framework, language, or empty domain', () => {
      expect(
        DocsGatewayInputSchema.safeParse({ framework: 'invalid-fw', domain: 'locators' }).success
      ).toBe(false);
      expect(
        DocsGatewayInputSchema.safeParse({
          framework: 'playwright',
          domain: 'locators',
          language: 'golang',
        }).success
      ).toBe(false);
      expect(
        DocsGatewayInputSchema.safeParse({ framework: 'playwright', domain: '' }).success
      ).toBe(false);
    });
  });

  describe('VerificationRequestSchema', () => {
    it('accepts valid VerificationRequest with minimal and full parameters', () => {
      const full = VerificationRequestSchema.safeParse({
        code: 'import { test, expect } from "@playwright/test";',
        framework: 'playwright',
        language: 'typescript',
        context: 'login spec',
      });
      expect(full.success).toBe(true);

      const minimal = VerificationRequestSchema.safeParse({
        code: 'cy.visit("/login");',
        framework: 'cypress',
      });
      expect(minimal.success).toBe(true);
    });

    it('rejects empty code, invalid framework, or unsupported language', () => {
      expect(
        VerificationRequestSchema.safeParse({ code: '', framework: 'playwright' }).success
      ).toBe(false);
      expect(
        VerificationRequestSchema.safeParse({ code: 'test()', framework: 'invalid-fw' }).success
      ).toBe(false);
      expect(
        VerificationRequestSchema.safeParse({
          code: 'test()',
          framework: 'playwright',
          language: 'golang',
        }).success
      ).toBe(false);
    });
  });

  describe('VerificationCheckSchema', () => {
    it('accepts valid check with required fields and all severities', () => {
      for (const severity of VERIFICATION_SEVERITIES) {
        const parsed = VerificationCheckSchema.safeParse({
          id: `check-${severity}`,
          rule: 'Rule description',
          passed: true,
          severity,
        });
        expect(parsed.success).toBe(true);
      }
    });

    it('rejects empty id, empty rule, or invalid severity', () => {
      expect(
        VerificationCheckSchema.safeParse({
          id: '',
          rule: 'valid',
          passed: true,
          severity: 'error',
        }).success
      ).toBe(false);
      expect(
        VerificationCheckSchema.safeParse({
          id: 'valid',
          rule: '',
          passed: true,
          severity: 'error',
        }).success
      ).toBe(false);
      expect(
        VerificationCheckSchema.safeParse({
          id: 'valid',
          rule: 'valid',
          passed: true,
          severity: 'unknown',
        }).success
      ).toBe(false);
    });
  });

  describe('VerificationResultSchema', () => {
    it('validates score boundaries and structure', () => {
      const valid = VerificationResultSchema.safeParse({
        passed: true,
        score: 100,
        complianceScore: 100,
        qualityScore: 100,
        checks: [],
        actionableHints: [],
      });
      expect(valid.success).toBe(true);

      const outOfBounds = VerificationResultSchema.safeParse({
        passed: false,
        score: 105,
        complianceScore: 100,
        qualityScore: 100,
        checks: [],
      });
      expect(outOfBounds.success).toBe(false);
    });
  });
});
