export const SUPPORTED_FRAMEWORKS = ['cypress', 'selenium', 'vibium', 'appium'] as const;
export type SupportedFramework = (typeof SUPPORTED_FRAMEWORKS)[number];

export const TARGET_HARNESSES = ['claude', 'gemini', 'codex', 'opencode', 'cursor', 'all'] as const;
export type TargetHarness = (typeof TARGET_HARNESSES)[number];

export function isSupportedFramework(val: unknown): val is SupportedFramework {
  return typeof val === 'string' && (SUPPORTED_FRAMEWORKS as readonly string[]).includes(val);
}

export function isTargetHarness(val: unknown): val is TargetHarness {
  return typeof val === 'string' && (TARGET_HARNESSES as readonly string[]).includes(val);
}

export interface InstallOptions {
  frameworks: SupportedFramework[];
  targets?: TargetHarness[];
  destDir: string;
  dryRun?: boolean;
  yes?: boolean;
}

export interface FrameworkMetadata {
  id: SupportedFramework;
  name: string;
  description: string;
  skillPrefix: string;
  agentFile: string;
  tools: readonly string[];
}

export interface McpServerEntry {
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export interface InstallResult {
  skillsCopied: number;
  agentsCopied: number;
  configsUpdated: string[];
}
