import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');

describe('AGENTS.md Canonical Directives & Specification Compliance', () => {
  it('verifies that root AGENTS.md exists and contains pure SDET directives', async () => {
    const agentsMdPath = path.join(rootDir, 'AGENTS.md');
    const md = await fs.readFile(agentsMdPath, 'utf8');

    // Root Title & Persona
    expect.soft(md.startsWith('# AGENTS.md')).toBe(true);
    expect.soft(md).toContain('Role & Mission:');
    expect.soft(md).toContain('You are an SDET AI Agent.');

    // 8 Invariant Engineering Directives
    expect.soft(md).toContain('Simplicity First:');
    expect.soft(md).toContain('Long-Term Quality:');
    expect.soft(md).toContain('Deterministic Synchronization:');
    expect.soft(md).toContain('Shift-Left State & Isolation:');
    expect.soft(md).toContain('Test Layering & Pyramid Discipline:');
    expect.soft(md).toContain('Clean Separation of Concerns:');
    expect.soft(md).toContain('Resilient Accessibility-First Targeting:');
    expect.soft(md).toContain('Idempotent Lifecycle & Resource Safety:');
  });

  it('verifies that AGENTS.md is strictly framework-agnostic without custom framework blocks', async () => {
    const agentsMdPath = path.join(rootDir, 'AGENTS.md');
    const md = await fs.readFile(agentsMdPath, 'utf8');

    expect.soft(md).not.toContain('### Cypress');
    expect.soft(md).not.toContain('### Selenium');
    expect.soft(md).not.toContain('### Vibium');
    expect.soft(md).not.toContain('### Appium');
  });
});
