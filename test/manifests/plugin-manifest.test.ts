import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';
import {
  PluginManifestSchema,
  McpManifestSchema,
  SkillSchema,
  SkillsManifestSchema,
  CAPABILITY_TOPICS,
  CAPABILITY_SKILL_NAMES,
  PLUGIN_NAME_REGEX,
  CWD_REGEX,
} from '../../scripts/schemas.js';

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

describe('Agent Plugins 1.0.0 Manifest Compliance & Zero-Conflict Schema Alignment', () => {
  describe('Plugin Manifest Schema & Metadata Alignment', () => {
    it('validates plugin.json schema and metadata with asynchronous I/O and strict validation', async () => {
      const pluginPath = path.join(rootDir, 'plugin.json');
      expect.soft(await fileExists(pluginPath)).toBe(true);

      const plugin = await readJsonFile<Record<string, unknown>>(pluginPath);
      const parsed = PluginManifestSchema.safeParse(plugin);

      expect.soft(parsed.success).toBe(true);
      expect
        .soft(plugin.$schema)
        .toBe('https://agent-plugins.org/schemas/1.0.0/plugin.schema.json');
      expect.soft(plugin.name).toMatch(PLUGIN_NAME_REGEX);
      expect.soft(Array.isArray(plugin.keywords)).toBe(true);
    });

    it('verifies zero schema conflicts and complete metadata sync between plugin.json and package.json', async () => {
      const pluginPath = path.join(rootDir, 'plugin.json');
      const pkgPath = path.join(rootDir, 'package.json');

      const plugin = await readJsonFile<{
        name: string;
        version?: string;
        description?: string;
        license?: string;
        repository?: string;
      }>(pluginPath);

      const pkg = await readJsonFile<{
        name: string;
        version: string;
        description?: string;
        license?: string;
        repository?: string | { url: string };
      }>(pkgPath);

      expect(plugin.name).toBe(pkg.name);
      expect(plugin.version).toBe(pkg.version);
      expect(plugin.description).toBe(pkg.description);
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

    it('verifies PluginManifestSchema rejects invalid plugin names', () => {
      const invalidNames = [
        'Invalid-Name', // Uppercase
        'plugin--name', // Consecutive hyphens
        'plugin..name', // Consecutive dots
        '-plugin', // Leading hyphen
        'plugin-', // Trailing hyphen
        '', // Empty string
      ];

      for (const name of invalidNames) {
        const parsed = PluginManifestSchema.safeParse({
          $schema: 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
          name,
        });
        expect.soft(parsed.success).toBe(false);
      }
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

    it('verifies PluginManifestSchema rejects invalid canonical $schema URL', () => {
      const invalidSchemaPlugin = {
        $schema: 'https://invalid-schema.org/schemas/plugin.json',
        name: 'awesome-sdet',
      };

      const parsed = PluginManifestSchema.safeParse(invalidSchemaPlugin);
      expect.soft(parsed.success).toBe(false);
    });
  });

  describe('MCP Manifest Schema & Server Configuration', () => {
    it('validates mcp.json stdio and streamable-http configurations and rejects unknown fields via strict discriminated union', async () => {
      const mcpPath = path.join(rootDir, 'mcp.json');
      expect.soft(await fileExists(mcpPath)).toBe(true);

      const mcp = await readJsonFile<Record<string, unknown>>(mcpPath);
      const parsed = McpManifestSchema.safeParse(mcp);

      expect.soft(parsed.success).toBe(true);
      expect.soft(mcp.$schema).toBe('https://agent-plugins.org/schemas/1.0.0/mcp.schema.json');

      const mcpServers = (mcp as { mcpServers: Record<string, Record<string, unknown>> })
        .mcpServers;
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

    it('mcp.json sdet-mcp stdio server should use ${PLUGIN_ROOT} in args and validate cwd constraints', async () => {
      const mcpPath = path.join(rootDir, 'mcp.json');
      const mcp = await readJsonFile<{ mcpServers: Record<string, { args?: string[] }> }>(mcpPath);
      expect(mcp.mcpServers['sdet-mcp']).toBeDefined();
      expect(mcp.mcpServers['sdet-mcp'].args).toContain('${PLUGIN_ROOT}/servers/dist/index.js');

      // Test CWD_REGEX enforcement
      const validCwdExamples = ['./subdir', '${PLUGIN_ROOT}/dir', '${PLUGIN_DATA}/storage'];
      for (const cwd of validCwdExamples) {
        expect.soft(CWD_REGEX.test(cwd)).toBe(true);
      }

      const invalidCwdExamples = ['/absolute/system/path', 'relative-without-prefix'];
      for (const cwd of invalidCwdExamples) {
        expect.soft(CWD_REGEX.test(cwd)).toBe(false);
      }
    });

    it('verifies McpManifestSchema rejects invalid canonical $schema URL and unknown transport types', () => {
      const invalidSchemaMcp = {
        $schema: 'https://example.com/wrong-mcp-schema.json',
        mcpServers: {},
      };
      expect.soft(McpManifestSchema.safeParse(invalidSchemaMcp).success).toBe(false);

      const invalidTypeMcp = {
        $schema: 'https://agent-plugins.org/schemas/1.0.0/mcp.schema.json',
        mcpServers: {
          'bad-server': {
            type: 'websocket',
            url: 'ws://localhost:8080',
          },
        },
      };
      expect.soft(McpManifestSchema.safeParse(invalidTypeMcp).success).toBe(false);
    });
  });

  describe('SkillSchema & Capability-First Skill Discovery', () => {
    it('strictly validates SkillSchema rules: framework must be sdet and topic must be canonical capability', () => {
      const validSkill = {
        name: 'sdet-actions',
        canonicalName: 'sdet/actions',
        framework: 'sdet' as const,
        topic: 'actions' as const,
        description: 'Deterministic user interactions pipeline.',
        filePath: 'skills/sdet-actions/SKILL.md',
      };
      expect.soft(SkillSchema.safeParse(validSkill).success).toBe(true);

      const nonSdetFrameworkSkill = {
        ...validSkill,
        framework: 'playwright',
      };
      expect.soft(SkillSchema.safeParse(nonSdetFrameworkSkill).success).toBe(false);

      const invalidTopicSkill = {
        ...validSkill,
        topic: 'non-existent-topic',
      };
      expect.soft(SkillSchema.safeParse(invalidTopicSkill).success).toBe(false);

      const unknownPropSkill = {
        ...validSkill,
        extraProp: 'forbidden',
      };
      expect.soft(SkillSchema.safeParse(unknownPropSkill).success).toBe(false);
    });

    it('verifies standard 1-level skill discovery for 8 canonical capability skills with valid frontmatter and references', async () => {
      const skillsDir = path.join(rootDir, 'skills');
      expect.soft(await fileExists(skillsDir)).toBe(true);

      const entries = await fs.readdir(skillsDir, { withFileTypes: true });
      const skillDirs = entries
        .filter((d) => d.isDirectory())
        .map((d) => d.name)
        .sort();

      const EXPECTED_CAPABILITY_SKILLS = [...CAPABILITY_SKILL_NAMES].sort();

      expect.soft(skillDirs).toEqual(EXPECTED_CAPABILITY_SKILLS);

      for (const skillDir of EXPECTED_CAPABILITY_SKILLS) {
        const skillFile = path.join(skillsDir, skillDir, 'SKILL.md');
        expect.soft(await fileExists(skillFile)).toBe(true);

        const content = await fs.readFile(skillFile, 'utf8');
        expect.soft(content.startsWith('---')).toBe(true);
        expect.soft(content).toContain(`name: ${skillDir}`);
        expect.soft(content).toContain('description:');
        expect.soft(content).toContain('user-invocable:');
        expect.soft(content).toContain('license:');

        const topic = skillDir.substring(5);
        expect.soft(CAPABILITY_TOPICS).toContain(topic);

        // Verify Level 1 and Level 2 Progressive Token Structure
        expect.soft(content).toContain('## 1. Overview');
        expect.soft(content).toContain('## 2. Core Invariants');
        expect.soft(content).toContain('## 3. When to Use');
        expect.soft(content).toContain('## 4. Universal Framework Paradigm Mapping');
        expect.soft(content).toContain('## 5. Dynamic MCP Tool & Resource Schemas');
      }
    });

    it('verifies SkillsManifestSchema validates aggregated skills output', () => {
      const sampleManifest = {
        schemaVersion: '1.0.0' as const,
        generatedAt: new Date().toISOString(),
        totalSkills: 8,
        totalAgents: 6,
        frameworks: ['appium', 'cypress', 'playwright', 'selenium', 'vibium'],
        agents: [
          {
            name: 'sdet',
            description: 'Master SDET orchestrator agent',
            filePath: 'agents/sdet.agent.md',
          },
        ],
        skills: {
          sdet: [
            {
              name: 'sdet-actions',
              canonicalName: 'sdet/actions',
              framework: 'sdet' as const,
              topic: 'actions' as const,
              description: 'Deterministic user interactions pipeline.',
              filePath: 'skills/sdet-actions/SKILL.md',
            },
          ],
        },
      };

      const result = SkillsManifestSchema.safeParse(sampleManifest);
      expect.soft(result.success).toBe(true);
    });
  });

  describe('Agent Directives & Discovery', () => {
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
});
