import { describe, expect, it } from 'vitest';

import { classifyIntent, IntentResultSchema, INTENT_TYPES } from '../../servers/src/registry.js';

describe('Typed Intent Router', () => {
  it('validates all INTENT_TYPES with IntentResultSchema', () => {
    for (const intent of INTENT_TYPES) {
      const parsed = IntentResultSchema.safeParse({
        intent,
        framework: 'playwright',
        domain: 'locators',
        language: 'typescript',
        confidence: 0.95,
        matchedKeywords: ['playwright', 'getByRole'],
      });
      expect(parsed.success).toBe(true);
    }
  });

  it('classifies intents from developer queries', () => {
    const authoring = classifyIntent('Generate Playwright TypeScript test for auth with getByRole');
    expect(authoring?.intent).toBe('author_test');
    expect(authoring?.framework).toBe('playwright');

    const migration = classifyIntent(
      'Migrate existing Selenium Java test with By.id to Playwright'
    );
    expect(migration?.intent).toBe('migrate_test');

    expect(classifyIntent('')).toBeNull();
  });
});
