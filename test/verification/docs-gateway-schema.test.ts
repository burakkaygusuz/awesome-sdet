import { describe, expect, it } from 'vitest';
import { FRAMEWORK_IDS, SUPPORTED_LANGUAGES } from '../../servers/src/registry.js';
import {
  DocsGatewayInputSchema,
  type DocsGatewayInput,
} from '../../servers/src/tools/docs-gateway.js';

describe('DocsGatewayInputSchema', () => {
  it('validates a valid universal docs request with all fields', () => {
    const validPayload: DocsGatewayInput = {
      framework: 'playwright',
      domain: 'locators',
      language: 'typescript',
      query: 'getByRole',
    };

    const parsed = DocsGatewayInputSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toEqual(validPayload);
    }
  });

  it('allows optional language and query', () => {
    const minimalPayload = {
      framework: 'cypress',
      domain: 'commands',
    };

    const parsed = DocsGatewayInputSchema.safeParse(minimalPayload);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.framework).toBe('cypress');
      expect(parsed.data.domain).toBe('commands');
      expect(parsed.data.language).toBeUndefined();
      expect(parsed.data.query).toBeUndefined();
    }
  });

  it('accepts all registered FRAMEWORK_IDS', () => {
    for (const framework of FRAMEWORK_IDS) {
      const payload = {
        framework,
        domain: 'actions',
      };
      const parsed = DocsGatewayInputSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    }
  });

  it('accepts all registered SUPPORTED_LANGUAGES when provided', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      const payload = {
        framework: 'selenium',
        domain: 'actions',
        language,
      };
      const parsed = DocsGatewayInputSchema.safeParse(payload);
      expect(parsed.success).toBe(true);
    }
  });

  it('rejects an unsupported framework', () => {
    const invalidPayload = {
      framework: 'unknown-framework',
      domain: 'locators',
    };

    const parsed = DocsGatewayInputSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('rejects an unsupported language', () => {
    const invalidPayload = {
      framework: 'playwright',
      domain: 'locators',
      language: 'golang',
    };

    const parsed = DocsGatewayInputSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
  });

  it('rejects missing or empty domain', () => {
    const missingDomain = { framework: 'playwright' };
    const emptyDomain = { framework: 'playwright', domain: '' };

    expect(DocsGatewayInputSchema.safeParse(missingDomain).success).toBe(false);
    expect(DocsGatewayInputSchema.safeParse(emptyDomain).success).toBe(false);
  });

  it('rejects unknown properties due to strict object validation', () => {
    const payloadWithExtra = {
      framework: 'playwright',
      domain: 'locators',
      extraProperty: 'unexpected',
    };

    const parsed = DocsGatewayInputSchema.safeParse(payloadWithExtra);
    expect(parsed.success).toBe(false);
  });
});
