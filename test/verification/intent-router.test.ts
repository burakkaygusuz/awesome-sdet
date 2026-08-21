import { describe, expect, it } from 'vitest';

import { classifyIntent, IntentResultSchema, INTENT_TYPES } from '../../servers/src/registry.js';

describe('Typed Intent Router', () => {
  describe('Intent Schema Validation', () => {
    it('validates all INTENT_TYPES', () => {
      for (const intent of INTENT_TYPES) {
        const payload = {
          intent,
          framework: 'playwright' as const,
          domain: 'locators',
          language: 'typescript' as const,
          confidence: 0.95,
          matchedKeywords: ['playwright', 'getByRole'],
        };
        const parsed = IntentResultSchema.safeParse(payload);
        expect(parsed.success).toBe(true);
      }
    });

    it('accepts null framework when query is universal or ambiguous', () => {
      const payload = {
        intent: 'author_test' as const,
        framework: null,
        confidence: 0.5,
        matchedKeywords: ['test'],
      };
      const parsed = IntentResultSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    });

    it('rejects invalid intent type or confidence out of bounds', () => {
      const invalidIntent = {
        intent: 'unknown_intent',
        framework: 'playwright',
        confidence: 0.9,
        matchedKeywords: [],
      };
      expect(IntentResultSchema.safeParse(invalidIntent).success).toBe(false);

      const invalidConfidence = {
        intent: 'author_test',
        framework: 'playwright',
        confidence: 1.5,
        matchedKeywords: [],
      };
      expect(IntentResultSchema.safeParse(invalidConfidence).success).toBe(false);
    });
  });

  describe('classifyIntent Resolution', () => {
    it('classifies authoring intent with framework and language', () => {
      const query = 'Generate a Playwright TypeScript test for user authentication with getByRole';
      const result = classifyIntent(query);

      expect(result).not.toBeNull();
      expect(result?.intent).toBe('author_test');
      expect(result?.framework).toBe('playwright');
      expect(result?.language).toBe('typescript');
      expect(result?.domain).toBe('locators');
      expect(result?.confidence).toBeGreaterThanOrEqual(0.7);
    });

    it('classifies migration intent from Selenium to Playwright', () => {
      const query = 'Migrate existing Selenium Java test with By.id to Playwright TypeScript';
      const result = classifyIntent(query);

      expect(result).not.toBeNull();
      expect(result?.intent).toBe('migrate_test');
      expect(result?.framework).toBe('playwright');
    });

    it('classifies diagnose flakiness intent', () => {
      const query = 'Diagnose flaky timing issue in Cypress test with cy.intercept and wait';
      const result = classifyIntent(query);

      expect(result).not.toBeNull();
      expect(result?.intent).toBe('diagnose_flakiness');
      expect(result?.framework).toBe('cypress');
      expect(result?.domain).toBe('network');
    });

    it('classifies docs lookup intent', () => {
      const query = 'Lookup docs and API reference for Appium gestures in Python';
      const result = classifyIntent(query);

      expect(result).not.toBeNull();
      expect(result?.intent).toBe('lookup_docs');
      expect(result?.framework).toBe('appium');
      expect(result?.language).toBe('python');
      expect(result?.domain).toBe('gestures');
    });

    it('classifies verify artifact intent', () => {
      const query = 'Verify test artifact for flakiness and missing assertions in Selenium';
      const result = classifyIntent(query);

      expect(result).not.toBeNull();
      expect(result?.intent).toBe('verify_artifact');
      expect(result?.framework).toBe('selenium');
    });

    it('returns null for empty or invalid query input', () => {
      expect(classifyIntent('')).toBeNull();
      expect(classifyIntent(null as unknown as string)).toBeNull();
    });
  });
});
