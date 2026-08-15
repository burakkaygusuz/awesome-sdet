import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import { z } from 'zod';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');

const PLUGIN_NAME_REGEX = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
const CWD_REGEX = /^(?:\.\/|\$\{PLUGIN_ROOT\}(?:\/|$)|(?:\$\{PLUGIN_DATA\}(?:\/|$)))/;

const AuthorObjectSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    url: z.string().optional(),
  })
  .strict();

const AuthorSchema = z.union([z.string(), AuthorObjectSchema]);

const PluginManifestSchema = z
  .object({
    $schema: z.literal('https://agent-plugins.org/schemas/1.0.0/plugin.schema.json'),
    name: z.string().min(1).max(64).regex(PLUGIN_NAME_REGEX),
    version: z.string().optional(),
    description: z.string().optional(),
    author: AuthorSchema.optional(),
    homepage: z.string().optional(),
    repository: z.string().optional(),
    license: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    extensions: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

const StdioMcpServerSchema = z
  .object({
    type: z.literal('stdio'),
    command: z.string(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string(), z.string()).optional(),
    cwd: z.string().regex(CWD_REGEX).optional(),
  })
  .strict();

const StreamableHttpMcpServerSchema = z
  .object({
    type: z.literal('streamable-http'),
    url: z.string(),
    headers: z.record(z.string(), z.string()).optional(),
  })
  .strict();

const SseMcpServerSchema = z
  .object({
    type: z.literal('sse'),
    url: z.string(),
    headers: z.record(z.string(), z.string()).optional(),
  })
  .strict();

const McpServerSchema = z.discriminatedUnion('type', [
  StdioMcpServerSchema,
  StreamableHttpMcpServerSchema,
  SseMcpServerSchema,
]);

const McpManifestSchema = z
  .object({
    $schema: z.literal('https://agent-plugins.org/schemas/1.0.0/mcp.schema.json'),
    mcpServers: z.record(z.string(), McpServerSchema),
  })
  .strict();

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

describe('Agent Plugins 1.0.0 Manifest Compliance & Robustness (Spec §5.4)', () => {
  it('validates plugin.json schema and metadata with asynchronous I/O and strict validation', async () => {
    const pluginPath = path.join(rootDir, 'plugin.json');
    expect.soft(await fileExists(pluginPath)).toBe(true);

    const plugin = await readJsonFile<Record<string, unknown>>(pluginPath);
    const parsed = PluginManifestSchema.safeParse(plugin);

    expect.soft(parsed.success).toBe(true);
    expect.soft(plugin.name).toMatch(/^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/);
    expect.soft(Array.isArray(plugin.keywords)).toBe(true);
  });

  it('verifies PluginManifestSchema rejects unknown top-level properties via .strict()', () => {
    const invalidPlugin = {
      $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
      name: 'awesome-sdet',
      unknownProperty: 'should-fail',
    };

    const parsed = PluginManifestSchema.safeParse(invalidPlugin);
    expect.soft(parsed.success).toBe(false);
  });

  it('verifies Spec §5.4 robustness: accepts loose semver, string author, and general URI strings', () => {
    const robustPlugin = {
      $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
      name: 'awesome-sdet',
      version: '2026.08-beta.1+build123',
      author: 'Burak Kaygusuz',
      homepage: 'git+ssh://github.com/burakkaygusuz',
      repository: 'https://github.com/burakkaygusuz/awesome-sdet',
    };

    const parsed = PluginManifestSchema.safeParse(robustPlugin);
    expect.soft(parsed.success).toBe(true);
  });

  it('validates mcp.json stdio and streamable-http configurations and rejects unknown fields via strict discriminated union', async () => {
    const mcpPath = path.join(rootDir, 'mcp.json');
    expect.soft(await fileExists(mcpPath)).toBe(true);

    const mcp = await readJsonFile<Record<string, unknown>>(mcpPath);
    const parsed = McpManifestSchema.safeParse(mcp);

    expect.soft(parsed.success).toBe(true);

    const mcpServers = (mcp as { mcpServers: Record<string, Record<string, unknown>> }).mcpServers;
    expect.soft(mcpServers['sdet-mcp']).toBeDefined();
    expect.soft(mcpServers['sdet-mcp'].type).toBe('stdio');
    expect.soft(mcpServers['sdet-mcp'].command).toBe('node');

    expect.soft(mcpServers['sdet-mcp-http']).toBeDefined();
    expect.soft(mcpServers['sdet-mcp-http'].type).toBe('streamable-http');
    expect.soft(mcpServers['sdet-mcp-http'].url).toBe('http://127.0.0.1:3000/mcp');

    const invalidMcp = {
      $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
      mcpServers: {
        'sdet-mcp': {
          type: 'streamable-http',
          url: 'http://127.0.0.1:3000/mcp',
          description: 'This extra property must be rejected',
        },
      },
    };

    const invalidParsed = McpManifestSchema.safeParse(invalidMcp);
    expect.soft(invalidParsed.success).toBe(false);
  });

  it('mcp.json sdet-mcp stdio server should use ${PLUGIN_ROOT} in args', async () => {
    const mcpPath = path.join(rootDir, 'mcp.json');
    const mcp = await readJsonFile<{ mcpServers: Record<string, { args?: string[] }> }>(mcpPath);
    expect(mcp.mcpServers['sdet-mcp']).toBeDefined();
    expect(mcp.mcpServers['sdet-mcp'].args).toContain('${PLUGIN_ROOT}/servers/dist/index.js');
  });

  it('verifies standard 1-level skill discovery in skills/ directory with asynchronous I/O', async () => {
    const skillsDir = path.join(rootDir, 'skills');
    expect.soft(await fileExists(skillsDir)).toBe(true);

    const entries = await fs.readdir(skillsDir, { withFileTypes: true });
    const skillDirs = entries.filter((d) => d.isDirectory()).map((d) => d.name);

    expect.soft(skillDirs.length).toBeGreaterThanOrEqual(1);

    for (const skillDir of skillDirs) {
      const skillFile = path.join(skillsDir, skillDir, 'SKILL.md');
      expect.soft(await fileExists(skillFile)).toBe(true);
    }
  });

  it('verifies concise hybrid orchestrator and specialist agents with soft assertions', async () => {
    const agentsDir = path.join(rootDir, 'agents');
    expect.soft(await fileExists(agentsDir)).toBe(true);

    const masterAgent = path.join(agentsDir, 'sdet.agent.md');
    const playwrightAgent = path.join(agentsDir, 'playwright/playwright.agent.md');
    const seleniumAgent = path.join(agentsDir, 'selenium/selenium.agent.md');
    const cypressAgent = path.join(agentsDir, 'cypress/cypress.agent.md');
    const vibiumAgent = path.join(agentsDir, 'vibium/vibium.agent.md');
    const appiumAgent = path.join(agentsDir, 'appium/appium.agent.md');

    expect.soft(await fileExists(masterAgent)).toBe(true);
    expect.soft(await fileExists(playwrightAgent)).toBe(true);
    expect.soft(await fileExists(seleniumAgent)).toBe(true);
    expect.soft(await fileExists(cypressAgent)).toBe(true);
    expect.soft(await fileExists(vibiumAgent)).toBe(true);
    expect.soft(await fileExists(appiumAgent)).toBe(true);
  });
});
