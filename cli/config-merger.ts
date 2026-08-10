import fs from 'node:fs/promises';
import path from 'node:path';
import type { McpServerEntry } from './types.js';

interface GenericMcpConfig {
  mcpServers?: Record<string, unknown>;
  [key: string]: unknown;
}

interface GenericOpencodeConfig {
  $schema?: string;
  mcp?: Record<string, unknown>;
  [key: string]: unknown;
}

export async function mergeMcpConfig(
  filePath: string,
  sdetMcpServer: McpServerEntry
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  let config: GenericMcpConfig = { mcpServers: {} };

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      config = parsed as GenericMcpConfig;
      if (!config.mcpServers || typeof config.mcpServers !== 'object') {
        config.mcpServers = {};
      }
    }
  } catch {
    config = { mcpServers: {} };
  }

  config.mcpServers = config.mcpServers || {};
  config.mcpServers['sdet-mcp'] = {
    type: 'stdio',
    ...sdetMcpServer,
  };

  await fs.writeFile(filePath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

export async function mergeOpencodeConfig(
  filePath: string,
  sdetMcpServer: McpServerEntry
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  let config: GenericOpencodeConfig = {
    $schema: 'https://opencode.ai/config.json',
    mcp: {},
  };

  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      config = parsed as GenericOpencodeConfig;
      if (!config.mcp || typeof config.mcp !== 'object') {
        config.mcp = {};
      }
    }
  } catch {
    config = { $schema: 'https://opencode.ai/config.json', mcp: {} };
  }

  config.mcp = config.mcp || {};
  config.mcp['sdet-mcp'] = {
    type: 'local',
    command: [sdetMcpServer.command, ...sdetMcpServer.args],
    enabled: true,
  };

  await fs.writeFile(filePath, JSON.stringify(config, null, 2) + '\n', 'utf8');
}

export async function mergeCodexConfig(
  filePath: string,
  sdetMcpServer: McpServerEntry
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });

  const argsFormatted = JSON.stringify(sdetMcpServer.args);
  const snippet = `
[mcp_servers.sdet-mcp]
command = "${sdetMcpServer.command}"
args = ${argsFormatted}
startup_timeout_sec = 15
`;

  let existing = '';
  try {
    existing = await fs.readFile(filePath, 'utf8');
  } catch {
    // Keep empty string if file does not exist
  }

  if (!existing.includes('[mcp_servers.sdet-mcp]')) {
    await fs.writeFile(filePath, (existing.trim() + '\n' + snippet).trim() + '\n', 'utf8');
  }
}
