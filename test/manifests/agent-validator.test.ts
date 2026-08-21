import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { collectAgents, validateAgentFile } from '../../scripts/validators/agent-validator.js';

const VALID_AGENT_FRONTMATTER = [
  '---',
  'name: playwright',
  "description: 'Principal SDET & Playwright Architect Agent for authoring resilient test automation.'",
  'user-invocable: true',
  '---',
  '',
].join('\n');

const VALID_AGENT_BODY = [
  '# Playwright Automation Specialist Agent',
  '',
  '## 1. Identity & Mission',
  'You are playwright, a Principal SDET.',
  '',
  '## 2. Knowledge & Tool Binding',
  'Consult `skills/sdet-locators` and `read_sdet_docs({ framework: "playwright", domain: "locators" })`.',
  'Adhere to `sdet://guidelines` and `sdet://invariants`.',
  '',
  '## 3. Standard Execution Playbook',
  '1. Mandatory Verification: Invoke `verify_test_artifact({ code, framework: "playwright", language })`.',
  '2. Perform bounded self-repair (max 2 iterations) if verification checks fail.',
  '',
].join('\n');

function agentContent(body: string, description?: string, name = 'playwright'): string {
  const frontmatter = [
    '---',
    `name: ${name}`,
    `description: '${description ?? 'Principal SDET & Playwright Architect Agent.'}'`,
    'user-invocable: true',
    '---',
    '',
  ].join('\n');
  return `${frontmatter}${body}`;
}

describe('agent validator guide enforcement & symmetry (§3.2/§3.3)', () => {
  let agentsDir: string;
  let rootDir: string;

  beforeAll(async () => {
    rootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'agent-validator-root-'));
    agentsDir = path.join(rootDir, 'agents');
    await fs.mkdir(path.join(agentsDir, 'playwright'), { recursive: true });
  });

  afterAll(async () => {
    await fs.rm(rootDir, { recursive: true, force: true });
  });

  async function validate(
    content: string,
    fileName = 'playwright.agent.md',
    subDir = 'playwright'
  ) {
    const targetDir = path.join(agentsDir, subDir);
    await fs.mkdir(targetDir, { recursive: true });
    const filePath = path.join(targetDir, fileName);
    await fs.writeFile(filePath, content, 'utf8');
    return validateAgentFile(filePath, rootDir);
  }

  it('accepts a valid agent specification matching frontmatter, directives, and tool bindings', async () => {
    const result = await validate(`${VALID_AGENT_FRONTMATTER}${VALID_AGENT_BODY}`);
    expect(result.hasError).toBe(false);
    expect(result.agent?.name).toBe('playwright');
    expect(result.agent?.canonicalName).toBe('sdet/playwright');
    expect(result.agent?.framework).toBe('playwright');
  });

  it('rejects an agent file missing frontmatter delimiters', async () => {
    const result = await validate('No frontmatter at all\n# Title\n');
    expect(result.hasError).toBe(true);
    expect(result.agent).toBeNull();
  });

  it('rejects an agent file missing required frontmatter attributes', async () => {
    const result = await validate('---\nuser-invocable: true\n---\n# Content\n');
    expect(result.hasError).toBe(true);
  });

  it('rejects an agent name that does not match directory or file name', async () => {
    const content = agentContent(VALID_AGENT_BODY, undefined, 'unknown-specialist');
    const result = await validate(content, 'playwright.agent.md', 'playwright');
    expect(result.hasError).toBe(true);
  });

  it('rejects an agent description exceeding 100 words', async () => {
    const longDesc = Array.from({ length: 101 }, (_, i) => `word${i}`).join(' ');
    const content = agentContent(VALID_AGENT_BODY, `Lead SDET. ${longDesc}`);
    const result = await validate(content);
    expect(result.hasError).toBe(true);
  });

  it('rejects an agent description at or above 1024 characters', async () => {
    const longDesc = 'a'.repeat(1024);
    const content = agentContent(VALID_AGENT_BODY, longDesc);
    const result = await validate(content);
    expect(result.hasError).toBe(true);
  });

  it('rejects hardcoded absolute or user-specific paths in agent body', async () => {
    const body = `${VALID_AGENT_BODY}\n- Link: [other](file:///Users/burak/repo/agents/sdet.agent.md)\n`;
    const result = await validate(agentContent(body));
    expect(result.hasError).toBe(true);
  });

  it('rejects obsolete legacy tool references (e.g. read_pw_docs)', async () => {
    const body = `${VALID_AGENT_BODY}\nCall read_pw_docs({ domain: "locators" })\n`;
    const result = await validate(agentContent(body));
    expect(result.hasError).toBe(true);
  });

  it('rejects invalid skill references not in CAPABILITY_SKILL_NAMES', async () => {
    const body = `${VALID_AGENT_BODY}\nConsult skills/sdet-nonexistent-skill for details.\n`;
    const result = await validate(agentContent(body));
    expect(result.hasError).toBe(true);
  });

  it('rejects invalid resource URIs not in registered resource set', async () => {
    const body = `${VALID_AGENT_BODY}\nRead sdet://nonexistent-resource for details.\n`;
    const result = await validate(agentContent(body));
    expect(result.hasError).toBe(true);
  });

  it('rejects agent body missing verify_test_artifact directive', async () => {
    const body = [
      '# Playwright Automation Specialist Agent',
      'You are playwright.',
      'Consult `skills/sdet-locators`.',
      'Perform self-repair if needed.',
    ].join('\n');
    const result = await validate(agentContent(body));
    expect(result.hasError).toBe(true);
  });

  it('rejects agent body missing bounded self-repair directive', async () => {
    const body = [
      '# Playwright Automation Specialist Agent',
      'You are playwright.',
      'Consult `skills/sdet-locators`.',
      'Invoke `verify_test_artifact({ code, framework: "playwright", language })`.',
    ].join('\n');
    const result = await validate(agentContent(body));
    expect(result.hasError).toBe(true);
  });

  it('collectAgents successfully collects and validates all active repository agents', async () => {
    const realRootDir = path.resolve(process.cwd());
    const result = await collectAgents(realRootDir);

    expect(result.hasErrors).toBe(false);
    expect(result.agents.length).toBe(6);

    const names = new Set(result.agents.map((a) => a.name));
    expect(names).toEqual(
      new Set(['sdet', 'playwright', 'selenium', 'cypress', 'vibium', 'appium'])
    );
  });
});
