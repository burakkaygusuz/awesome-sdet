import { describe, expect, it } from 'vitest';

import { generateAgentsMarkdown } from '../../cli/agents-generator.js';

describe('AGENTS.md Generator', () => {
  it('should generate pure SDET Directives & Quality Standards', () => {
    const md = generateAgentsMarkdown();
    expect.soft(md).toContain('# AGENTS.md');
    expect.soft(md).toContain('Role & Mission:');
    expect.soft(md).toContain('You are an SDET AI Agent.');
    expect.soft(md).toContain('Simplicity First:');
    expect.soft(md).toContain('Deterministic Synchronization:');
    expect.soft(md).toContain('Shift-Left State & Isolation:');
    expect.soft(md).toContain('Test Layering & Pyramid Discipline:');
    expect.soft(md).toContain('Clean Separation of Concerns:');
    expect.soft(md).toContain('Resilient Accessibility-First Targeting:');
    expect.soft(md).toContain('Idempotent Lifecycle & Resource Safety:');
  });

  it('should maintain strict framework-agnostic architecture without hardcoded framework names', () => {
    const md = generateAgentsMarkdown();
    expect.soft(md).not.toContain('### Cypress');
    expect.soft(md).not.toContain('### Selenium');
    expect.soft(md).not.toContain('### Vibium');
    expect.soft(md).not.toContain('### Appium');
  });
});
