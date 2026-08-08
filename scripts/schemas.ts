import { z } from 'zod';

export const PLUGIN_NAME_REGEX = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
export const CWD_REGEX = /^(?:\.\/|\$\{PLUGIN_ROOT\}(?:\/|$)|(?:\$\{PLUGIN_DATA\}(?:\/|$)))/;

export const AuthorObjectSchema = z
  .object({
    name: z.string().optional(),
    email: z.string().optional(),
    url: z.string().optional(),
  })
  .strict();

export const AuthorSchema = z.union([z.string(), AuthorObjectSchema]);

/**
 * Agent Plugins 1.0.0 Root Plugin Manifest Schema
 * Conforms strictly to https://agent-plugins.org/schemas/1.0.0/plugin.schema.json
 * Section §5.4 Robustness: Does not reject loose semver, URLs, or email strings,
 * while strictly prohibiting unknown/unsupported top-level properties (.strict()).
 */
export const PluginManifestSchema = z
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

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

export const StdioMcpServerSchema = z
  .object({
    type: z.literal('stdio'),
    command: z.string(),
    args: z.array(z.string()).optional(),
    env: z.record(z.string(), z.string()).optional(),
    cwd: z.string().optional(),
  })
  .strict();

export const StreamableHttpMcpServerSchema = z
  .object({
    type: z.literal('streamable-http'),
    url: z.string(),
    headers: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const SseMcpServerSchema = z
  .object({
    type: z.literal('sse'),
    url: z.string(),
    headers: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const McpServerSchema = z.discriminatedUnion('type', [
  StdioMcpServerSchema,
  StreamableHttpMcpServerSchema,
  SseMcpServerSchema,
]);

export type McpServer = z.infer<typeof McpServerSchema>;

/**
 * Agent Plugins 1.0.0 MCP Server Manifest Schema
 * Conforms strictly to https://agent-plugins.org/schemas/1.0.0/mcp.schema.json
 */
export const McpManifestSchema = z
  .object({
    $schema: z.literal('https://agent-plugins.org/schemas/1.0.0/mcp.schema.json'),
    mcpServers: z.record(z.string(), McpServerSchema),
  })
  .strict();

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
