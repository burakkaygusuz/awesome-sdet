import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { mergeCodexConfig, mergeMcpConfig, mergeOpencodeConfig } from '../../cli/config-merger.js';
import type { McpServerEntry } from '../../cli/types.js';

describe('CLI Config Merger', () => {
  let tmpDir: string;
  const mockServer: McpServerEntry = {
    command: 'node',
    args: ['/path/to/servers/dist/index.js', '--stdio'],
  };

  const expectedMcpEntry = {
    command: 'node',
    args: ['/path/to/servers/dist/index.js', '--stdio'],
    type: 'stdio',
  };

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'mcp-merge-test-'));
  });

  afterEach(async () => {
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  describe('Standard MCP Config (.mcp.json & mcp_config.json)', () => {
    it('should create new .mcp.json if file does not exist', async () => {
      const mcpPath = path.join(tmpDir, '.mcp.json');
      await mergeMcpConfig(mcpPath, mockServer);

      const content = await fs.readFile(mcpPath, 'utf8');
      const parsed = JSON.parse(content);
      expect.soft(parsed.mcpServers['sdet-mcp']).toEqual(expectedMcpEntry);
    });

    it('should preserve existing servers and other properties in .mcp.json', async () => {
      const mcpPath = path.join(tmpDir, '.mcp.json');
      await fs.writeFile(
        mcpPath,
        JSON.stringify(
          {
            version: '1.0',
            mcpServers: {
              postgres: { command: 'npx', args: ['server-postgres'] },
            },
          },
          null,
          2
        )
      );

      await mergeMcpConfig(mcpPath, mockServer);

      const content = await fs.readFile(mcpPath, 'utf8');
      const parsed = JSON.parse(content);
      expect.soft(parsed.version).toBe('1.0');
      expect.soft(parsed.mcpServers.postgres).toEqual({
        command: 'npx',
        args: ['server-postgres'],
      });
      expect.soft(parsed.mcpServers['sdet-mcp']).toEqual(expectedMcpEntry);
    });

    it('should be idempotent when merged multiple times', async () => {
      const mcpPath = path.join(tmpDir, 'mcp_config.json');
      await mergeMcpConfig(mcpPath, mockServer);
      await mergeMcpConfig(mcpPath, mockServer);
      await mergeMcpConfig(mcpPath, mockServer);

      const content = await fs.readFile(mcpPath, 'utf8');
      const parsed = JSON.parse(content);
      expect.soft(Object.keys(parsed.mcpServers)).toEqual(['sdet-mcp']);
      expect.soft(parsed.mcpServers['sdet-mcp']).toEqual(expectedMcpEntry);
    });

    it('should recover gracefully from malformed JSON by creating fresh valid config', async () => {
      const mcpPath = path.join(tmpDir, '.mcp.json');
      await fs.writeFile(mcpPath, '{ invalid json content !!!', 'utf8');

      await mergeMcpConfig(mcpPath, mockServer);

      const content = await fs.readFile(mcpPath, 'utf8');
      const parsed = JSON.parse(content);
      expect.soft(parsed.mcpServers['sdet-mcp']).toEqual(expectedMcpEntry);
    });
  });

  describe('OpenCode Config (opencode.json)', () => {
    it('should create new opencode.json with array-style command format', async () => {
      const opencodePath = path.join(tmpDir, 'opencode.json');
      await mergeOpencodeConfig(opencodePath, mockServer);

      const content = await fs.readFile(opencodePath, 'utf8');
      const parsed = JSON.parse(content);
      expect.soft(parsed.mcp['sdet-mcp']).toEqual({
        command: ['node', '/path/to/servers/dist/index.js', '--stdio'],
        type: 'local',
        enabled: true,
      });
    });

    it('should preserve other OpenCode configurations and plugins', async () => {
      const opencodePath = path.join(tmpDir, 'opencode.json');
      await fs.writeFile(
        opencodePath,
        JSON.stringify(
          {
            theme: 'dark',
            plugins: ['opencode-git'],
            mcp: {
              sqlite: { command: ['sqlite-mcp'], type: 'local' },
            },
          },
          null,
          2
        )
      );

      await mergeOpencodeConfig(opencodePath, mockServer);

      const content = await fs.readFile(opencodePath, 'utf8');
      const parsed = JSON.parse(content);
      expect.soft(parsed.theme).toBe('dark');
      expect.soft(parsed.plugins).toEqual(['opencode-git']);
      expect.soft(parsed.mcp.sqlite).toEqual({ command: ['sqlite-mcp'], type: 'local' });
      expect.soft(parsed.mcp['sdet-mcp']).toBeDefined();
    });

    it('should be idempotent across repeated merges', async () => {
      const opencodePath = path.join(tmpDir, 'opencode.json');
      await mergeOpencodeConfig(opencodePath, mockServer);
      await mergeOpencodeConfig(opencodePath, mockServer);

      const content = await fs.readFile(opencodePath, 'utf8');
      const parsed = JSON.parse(content);
      expect.soft(Object.keys(parsed.mcp)).toEqual(['sdet-mcp']);
    });
  });

  describe('OpenAI Codex Config (.codex/config.toml)', () => {
    it('should create .codex/ directory and config.toml if non-existent', async () => {
      const codexPath = path.join(tmpDir, '.codex', 'config.toml');
      await mergeCodexConfig(codexPath, mockServer);

      const content = await fs.readFile(codexPath, 'utf8');
      expect.soft(content).toContain('[mcp_servers.sdet-mcp]');
      expect.soft(content).toContain('command = "node"');
      expect.soft(content).toContain('args = ["/path/to/servers/dist/index.js","--stdio"]');
    });

    it('should preserve existing TOML content without duplicate server blocks', async () => {
      const codexPath = path.join(tmpDir, '.codex', 'config.toml');
      await fs.mkdir(path.dirname(codexPath), { recursive: true });
      await fs.writeFile(
        codexPath,
        'model = "gpt-5-codex"\n\n[mcp_servers.sqlite]\ncommand = "sqlite3"\n',
        'utf8'
      );

      await mergeCodexConfig(codexPath, mockServer);
      await mergeCodexConfig(codexPath, mockServer); // Idempotency check

      const content = await fs.readFile(codexPath, 'utf8');
      expect.soft(content).toContain('model = "gpt-5-codex"');
      expect.soft(content).toContain('[mcp_servers.sqlite]');
      expect.soft(content).toContain('[mcp_servers.sdet-mcp]');
      const occurrences = (content.match(/\[mcp_servers\.sdet-mcp\]/g) || []).length;
      expect.soft(occurrences).toBe(1);
    });
  });
});
