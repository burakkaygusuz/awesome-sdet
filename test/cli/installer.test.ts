import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { runInstallation } from '../../cli/installer.js';

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

describe('CLI Installer Engine', () => {
  let targetDir: string;

  beforeEach(async () => {
    targetDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sdet-installer-suite-'));
  });

  afterEach(async () => {
    await fs.rm(targetDir, { recursive: true, force: true });
  });

  it('should install all 32 skills, 5 agents, and all 4 harness configs for full installation', async () => {
    const result = await runInstallation({
      frameworks: ['cypress', 'selenium', 'vibium', 'appium'],
      targets: ['all'],
      destDir: targetDir,
    });

    expect.soft(result.skillsCopied).toBe(32);
    expect.soft(result.agentsCopied).toBe(5);
    expect.soft(result.configsUpdated.length).toBe(4);

    // Verify file tree structure
    const installedSkills = await fs.readdir(path.join(targetDir, '.agents', 'skills'));
    expect.soft(installedSkills.length).toBe(32);

    // Deep check: every skill folder must contain a valid SKILL.md
    for (const skill of installedSkills) {
      const skillMd = path.join(targetDir, '.agents', 'skills', skill, 'SKILL.md');
      expect.soft(await pathExists(skillMd)).toBe(true);
      const content = await fs.readFile(skillMd, 'utf8');
      expect.soft(content.length).toBeGreaterThan(50);
      expect.soft(content).toContain('name:');
    }

    const installedAgents = await fs.readdir(path.join(targetDir, 'agents'));
    expect.soft(installedAgents.length).toBe(5);
    expect.soft(installedAgents).toContain('sdet.agent.md');
    expect.soft(installedAgents).toContain('cypress.agent.md');
    expect.soft(installedAgents).toContain('selenium.agent.md');
    expect.soft(installedAgents).toContain('vibium.agent.md');
    expect.soft(installedAgents).toContain('appium.agent.md');

    // Verify all 4 harness configs exist and are valid
    expect.soft(await pathExists(path.join(targetDir, 'AGENTS.md'))).toBe(true);
    expect.soft(await pathExists(path.join(targetDir, '.mcp.json'))).toBe(true);
    expect.soft(await pathExists(path.join(targetDir, 'mcp_config.json'))).toBe(true);
    expect.soft(await pathExists(path.join(targetDir, 'opencode.json'))).toBe(true);
    expect.soft(await pathExists(path.join(targetDir, '.codex', 'config.toml'))).toBe(true);

    // Verify MCP config content payload
    const mcpContent = JSON.parse(await fs.readFile(path.join(targetDir, '.mcp.json'), 'utf8'));
    expect.soft(mcpContent.mcpServers['sdet-mcp'].command).toBe('node');
    expect.soft(mcpContent.mcpServers['sdet-mcp'].args[1]).toBe('--stdio');
  });

  it('should cleanly isolate selective installations without cross-framework leakage', async () => {
    const result = await runInstallation({
      frameworks: ['vibium'],
      targets: ['all'],
      destDir: targetDir,
    });

    expect.soft(result.skillsCopied).toBe(5);
    expect.soft(result.agentsCopied).toBe(2); // vibium.agent.md + sdet.agent.md

    const installedSkills = await fs.readdir(path.join(targetDir, '.agents', 'skills'));
    expect.soft(installedSkills.length).toBe(5);
    expect.soft(installedSkills.every((s) => s.startsWith('vibium-'))).toBe(true);
    expect.soft(installedSkills.some((s) => s.startsWith('cypress-'))).toBe(false);
    expect.soft(installedSkills.some((s) => s.startsWith('selenium-'))).toBe(false);
    expect.soft(installedSkills.some((s) => s.startsWith('appium-'))).toBe(false);

    const installedAgents = await fs.readdir(path.join(targetDir, 'agents'));
    expect.soft(installedAgents.sort()).toEqual(['sdet.agent.md', 'vibium.agent.md']);
  });

  it('should respect target harness filters when specified', async () => {
    const result = await runInstallation({
      frameworks: ['cypress'],
      targets: ['claude'],
      destDir: targetDir,
    });

    expect.soft(result.configsUpdated).toEqual(['.mcp.json']);
    expect.soft(await pathExists(path.join(targetDir, '.mcp.json'))).toBe(true);
    expect.soft(await pathExists(path.join(targetDir, 'opencode.json'))).toBe(false);
    expect.soft(await pathExists(path.join(targetDir, '.codex', 'config.toml'))).toBe(false);
  });

  it('should be completely idempotent when re-run in the same project directory', async () => {
    const firstRun = await runInstallation({
      frameworks: ['appium'],
      targets: ['all'],
      destDir: targetDir,
    });
    expect.soft(firstRun.skillsCopied).toBe(5);

    // Second run with additional framework
    const secondRun = await runInstallation({
      frameworks: ['appium', 'vibium'],
      targets: ['all'],
      destDir: targetDir,
    });
    expect.soft(secondRun.skillsCopied).toBe(10);

    const installedSkills = await fs.readdir(path.join(targetDir, '.agents', 'skills'));
    expect.soft(installedSkills.length).toBe(10);
  });
});
