import { z } from 'zod';

export const PLUGIN_NAME_REGEX = /^(?!.*(?:--|\.\.))[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/;
export const CWD_REGEX = /^(?:\.\/|\$\{PLUGIN_ROOT\}(?:\/|$)|(?:\$\{PLUGIN_DATA\}(?:\/|$)))/;

export const AuthorObjectSchema = z.strictObject({
  name: z.string().optional(),
  email: z.string().optional(),
  url: z.string().optional(),
});

export const AuthorSchema = z.union([z.string(), AuthorObjectSchema]);

/**
 * Agent Plugins 1.0.0 Root Plugin Manifest Schema
 * Conforms strictly to https://agent-plugins.org/schemas/1.0.0/plugin.schema.json
 * Section §5.4 Robustness: Does not reject loose semver, URLs, or email strings,
 * while strictly prohibiting unknown/unsupported top-level properties (.strict()).
 */
export const PluginManifestSchema = z.strictObject({
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
});

export type PluginManifest = z.infer<typeof PluginManifestSchema>;

export const StdioMcpServerSchema = z.strictObject({
  type: z.literal('stdio'),
  command: z.string().min(1),
  args: z.array(z.string()).optional(),
  env: z.record(z.string(), z.string()).optional(),
  cwd: z.string().regex(CWD_REGEX).optional(),
});

export const StreamableHttpMcpServerSchema = z.strictObject({
  type: z.literal('streamable-http'),
  url: z.string().min(1),
  headers: z.record(z.string(), z.string()).optional(),
});

export const SseMcpServerSchema = z.strictObject({
  type: z.literal('sse'),
  url: z.string().min(1),
  headers: z.record(z.string(), z.string()).optional(),
});

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
export const McpManifestSchema = z.strictObject({
  $schema: z.literal('https://agent-plugins.org/schemas/1.0.0/mcp.schema.json'),
  mcpServers: z.record(z.string(), McpServerSchema),
});

export type McpManifest = z.infer<typeof McpManifestSchema>;

export const CAPABILITY_TOPICS = [
  'actions',
  'assertions',
  'authoring',
  'locators',
  'mobile',
  'network',
  'observability',
  'storage-state',
] as const;

export type CapabilityTopic = (typeof CAPABILITY_TOPICS)[number];

export const CAPABILITY_SKILL_NAMES = [
  'sdet-actions',
  'sdet-assertions',
  'sdet-authoring',
  'sdet-locators',
  'sdet-mobile',
  'sdet-network',
  'sdet-observability',
  'sdet-storage-state',
] as const;

export type CapabilitySkillName = (typeof CAPABILITY_SKILL_NAMES)[number];

export const SkillFrontmatterMetadataSchema = z.strictObject({
  capability: z.enum(CAPABILITY_TOPICS).optional(),
  frameworks: z.string().optional(),
});

export const SkillFrontmatterSchema = z.strictObject({
  name: z.string().min(1),
  description: z.string().min(1),
  'user-invocable': z.union([z.boolean(), z.literal('true'), z.literal('false')]),
  license: z.string().min(1),
  metadata: SkillFrontmatterMetadataSchema.optional(),
});

export type SkillFrontmatter = z.infer<typeof SkillFrontmatterSchema>;

/**
 * Skill Schema: strictly reflects capability-first skills with framework: 'sdet'
 * and capability topics, enforcing strict property checks.
 */
export const SkillSchema = z.strictObject({
  name: z.string().min(1),
  canonicalName: z.string().min(1),
  framework: z.literal('sdet'),
  topic: z.enum(CAPABILITY_TOPICS),
  description: z.string().min(1),
  filePath: z.string().min(1),
});

export type Skill = z.infer<typeof SkillSchema>;

export const AgentFrontmatterSchema = z.strictObject({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)?$/),
  description: z.string().min(1),
  'user-invocable': z.union([z.boolean(), z.literal('true'), z.literal('false')]).optional(),
  tools: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  model: z.string().optional(),
});

export type AgentFrontmatter = z.infer<typeof AgentFrontmatterSchema>;

export const AgentInfoSchema = z.strictObject({
  name: z.string().min(1),
  canonicalName: z.string().min(1).optional(),
  description: z.string().min(1),
  filePath: z.string().min(1),
  framework: z.string().optional(),
});

export type AgentInfo = z.infer<typeof AgentInfoSchema>;

export const SkillsManifestSchema = z.strictObject({
  schemaVersion: z.literal('1.0.0'),
  generatedAt: z.string(),
  totalSkills: z.number().int().nonnegative(),
  totalAgents: z.number().int().nonnegative(),
  frameworks: z.array(z.string()),
  agents: z.array(AgentInfoSchema),
  skills: z.record(z.string(), z.array(SkillSchema)),
});

export type SkillsManifest = z.infer<typeof SkillsManifestSchema>;
