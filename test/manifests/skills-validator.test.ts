import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { validateSkillFile } from '../../scripts/validators/skills-validator.js';

const VALID_FRONTMATTER = [
  '---',
  'name: sdet-locators',
  "description: 'Use this skill when authoring element locators.'",
  'user-invocable: true',
  'license: MIT',
  '---',
  '',
].join('\n');

function skillFile(body: string, description?: string): string {
  const frontmatter =
    description === undefined
      ? VALID_FRONTMATTER
      : VALID_FRONTMATTER.replace(
          "description: 'Use this skill when authoring element locators.'",
          `description: '${description}'`
        );
  return `${frontmatter}${body}`;
}

describe('skills validator guide enforcement (§3.2/§3.3)', () => {
  let skillsDir: string;
  let rootDir: string;

  beforeAll(async () => {
    rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'skills-validator-root-'));
    skillsDir = path.join(rootDir, 'skills');
    await fs.mkdir(path.join(skillsDir, 'sdet-locators'), { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(rootDir, { recursive: true, force: true });
  });

  async function validate(content: string) {
    const filePath = path.join(skillsDir, 'sdet-locators', 'SKILL.md');
    await fs.writeFile(filePath, content, 'utf8');
    return validateSkillFile(filePath, rootDir, skillsDir);
  }

  it('accepts a lean skill body and a trigger-focused description', async () => {
    const result = await validate(skillFile('# Universal Locators\n\nBody content.\n'));
    expect(result.hasError).toBe(false);
    expect(result.skill?.name).toBe('sdet-locators');
  });

  it('rejects a body exceeding the 500-line limit', async () => {
    const body = `${'# Heading\n\n'.repeat(251)}${'filler line\n'.repeat(1)}`;
    const oversized = Array.from({ length: 501 }, (_, i) => `line ${i}`).join('\n');
    expect(body.length).toBeGreaterThan(0);
    const result = await validate(`${VALID_FRONTMATTER}${oversized}\n`);
    expect(result.hasError).toBe(true);
  });

  it('rejects a body over 300 lines without a Table of Contents', async () => {
    const body = Array.from({ length: 301 }, (_, i) => `line ${i}`).join('\n');
    const result = await validate(`${VALID_FRONTMATTER}${body}\n`);
    expect(result.hasError).toBe(true);
  });

  it('accepts a body over 300 lines when a Table of Contents is present', async () => {
    const body = `# Heading\n\n## Table of Contents\n\n- [Section](#section)\n\n${Array.from(
      { length: 301 },
      (_, i) => `line ${i}`
    ).join('\n')}`;
    const result = await validate(`${VALID_FRONTMATTER}${body}\n`);
    expect(result.hasError).toBe(false);
  });

  it('rejects a description exceeding the 100-word budget', async () => {
    const longDescription = Array.from({ length: 101 }, (_, i) => `word${i}`).join(' ');
    const result = await validate(
      skillFile('# Heading\n\nBody.\n', `Use this skill when testing. ${longDescription}`)
    );
    expect(result.hasError).toBe(true);
  });

  it('rejects a description at or above the 1024-character specification limit', async () => {
    const longDescription = 'a'.repeat(1024);
    const result = await validate(skillFile('# Heading\n\nBody.\n', longDescription));
    expect(result.hasError).toBe(true);
  });

  it('rejects hardcoded absolute or user-specific file paths in body', async () => {
    const result = await validate(
      skillFile('# Heading\n\n- Link: [other](file:///Users/burak/repo/skills/sdet/SKILL.md)\n')
    );
    expect(result.hasError).toBe(true);
  });
});
