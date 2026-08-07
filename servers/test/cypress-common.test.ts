import { describe, it, expect } from 'vitest';
import { readCypressReferenceDoc } from '../src/cypress/common.js';

describe('Cypress Common Helper', () => {
  it('reads reference documentation correctly for valid language', () => {
    const content = readCypressReferenceDoc('commands', 'javascript');
    expect(content).toContain('cy.get');
  });

  it('throws descriptive error for invalid language', () => {
    expect(() => readCypressReferenceDoc('commands', 'python')).toThrow(/Unsupported language/);
  });
});
