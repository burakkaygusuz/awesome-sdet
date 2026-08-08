import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');

async function readJsonFile<T>(filePath: string): Promise<T> {
  const content = await fs.readFile(filePath, 'utf8');
  return JSON.parse(content);
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

describe('Agent Plugins 1.0.0 Manifest Compliance', () => {
  it('validates plugin.json schema and metadata with asynchronous I/O and soft assertions', async () => {
    const pluginPath = path.join(rootDir, 'plugin.json');
    expect.soft(await fileExists(pluginPath)).toBe(true);

    const plugin = await readJsonFile<Record<string, unknown>>(pluginPath);

    expect.soft(plugin).toMatchObject({
      $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
      name: 'awesome-sdet',
      license: 'MIT',
      repository: 'https://github.com/burakkaygusuz/awesome-sdet',
      author: {
        name: 'Burak Kaygusuz',
        url: 'https://github.com/burakkaygusuz',
      },
    });

    expect.soft(plugin.name).toMatch(/^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/);
    expect.soft(plugin.version).toMatch(/^\d+\.\d+\.\d+$/);
    expect.soft(typeof plugin.description).toBe('string');
    expect.soft(Array.isArray(plugin.keywords)).toBe(true);
  });

  it('validates mcp.json streamable-http configuration with asynchronous I/O and soft assertions', async () => {
    const mcpPath = path.join(rootDir, 'mcp.json');
    expect.soft(await fileExists(mcpPath)).toBe(true);

    const mcp = await readJsonFile<Record<string, unknown>>(mcpPath);

    expect.soft(mcp).toMatchObject({
      $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
      mcpServers: {
        'sdet-mcp': {
          type: 'streamable-http',
          url: 'http://127.0.0.1:3000/mcp',
        },
      },
    });
  });

  it('verifies framework directories in skills/ directory with asynchronous I/O and soft assertions', async () => {
    const skillsDir = path.join(rootDir, 'skills');
    expect.soft(await fileExists(skillsDir)).toBe(true);

    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    const frameworks = entries.filter((d) => d.isDirectory()).map((d) => d.name);

    expect.soft(frameworks).toContain('selenium');
    expect.soft(frameworks).toContain('cypress');
  });

  it('verifies concise hybrid orchestrator and specialist agents with soft assertions', async () => {
    const agentsDir = path.join(rootDir, 'agents');
    expect.soft(await fileExists(agentsDir)).toBe(true);

    const masterAgent = path.join(agentsDir, 'sdet.agent.md');
    const seleniumAgent = path.join(agentsDir, 'selenium/selenium.agent.md');
    const cypressAgent = path.join(agentsDir, 'cypress/cypress.agent.md');

    expect.soft(await fileExists(masterAgent)).toBe(true);
    expect.soft(await fileExists(seleniumAgent)).toBe(true);
    expect.soft(await fileExists(cypressAgent)).toBe(true);
  });
});
