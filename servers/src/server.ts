import { McpServer, type ToolAnnotations } from '@modelcontextprotocol/server';
import { registerSeleniumTools } from './domains/selenium/index.js';
import { registerCypressTools } from './domains/cypress/index.js';
import { registerVibiumTools } from './domains/vibium/index.js';
import { registerAppiumTools } from './domains/appium/index.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';
import { SERVER_NAME, SERVER_VERSION } from './version.js';

export const PROTOCOL_VERSION_2026_07_28 = '2026-07-28';

export interface CacheableResult {
  ttlMs?: number;
  cacheScope?: 'global' | 'session' | 'user';
}

export interface ToolExecutionResult extends CacheableResult {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export const DEFAULT_DOCS_CACHE_TTL_MS = 3_600_000; // 1 hour TTL for immutable reference docs
export const GLOBAL_CACHE_SCOPE = 'global' as const;

export function safeToolHandler<T>(
  handler: (args: T) => ToolExecutionResult | Promise<ToolExecutionResult>
): (args: T, extra?: unknown) => Promise<ToolExecutionResult> {
  return async (args: T): Promise<ToolExecutionResult> => {
    try {
      const result = await handler(args);
      return {
        ttlMs: DEFAULT_DOCS_CACHE_TTL_MS,
        cacheScope: GLOBAL_CACHE_SCOPE,
        ...result,
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text' as const,
            text: `Tool Execution Error: ${error instanceof Error ? error.message : String(error)}`,
          },
        ],
        isError: true,
      };
    }
  };
}

export const SAFE_READONLY_ANNOTATIONS: ToolAnnotations = {
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
};

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  registerSeleniumTools(server, safeToolHandler, SAFE_READONLY_ANNOTATIONS);
  registerCypressTools(server, safeToolHandler, SAFE_READONLY_ANNOTATIONS);
  registerVibiumTools(server, safeToolHandler, SAFE_READONLY_ANNOTATIONS);
  registerAppiumTools(server, safeToolHandler, SAFE_READONLY_ANNOTATIONS);

  registerResources(server);
  registerPrompts(server);

  return server;
}
