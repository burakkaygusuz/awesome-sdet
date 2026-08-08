import { z } from 'zod';

export const PLUGIN_NAME_REGEX = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
export const SEMVER_REGEX = /^\d+\.\d+\.\d+$/;
export const CWD_REGEX = /^(?:\.\/|\$\{PLUGIN_ROOT\}(?:\/|$)|(?:\$\{PLUGIN_DATA\}(?:\/|$)))/;

export const PluginManifestSchema = z.object({
  $schema: z.literal('https://agent-plugins.org/schemas/1.0.0/plugin.schema.json'),
  name: z.string().min(1).max(64).regex(PLUGIN_NAME_REGEX),
  version: z.string().regex(SEMVER_REGEX).optional(),
  description: z.string().min(10).optional(),
  author: z
    .object({
      name: z.string().optional(),
      email: z.email().optional(),
      url: z.url().optional(),
    })
    .optional(),
  homepage: z.url().optional(),
  repository: z.url().optional(),
  license: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  extensions: z.record(z.string(), z.unknown()).optional(),
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

export const McpServerSchema = z.object({
  type: z.enum(['stdio', 'streamable-http', 'sse']),
  url: z.url().optional(),
  command: z.string().optional(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
  cwd: z.string().regex(CWD_REGEX).optional(),
  headers: z.record(z.string(), z.string()).optional(),
});

export type McpServer = z.infer<typeof McpServerSchema>;

export const McpManifestSchema = z.object({
  $schema: z.literal('https://agent-plugins.org/schemas/1.0.0/mcp.schema.json'),
  mcpServers: z.record(z.string(), McpServerSchema),
});

export type McpManifest = z.infer<typeof McpManifestSchema>;

export interface Skill {
  name: string;
  canonicalName: string;
  framework: string;
  topic: string;
  description: string;
  filePath: string;
}

export const REQUIRED_FRONTMATTER = ['name', 'description', 'user-invocable', 'license'];
