import { McpServer, type ToolAnnotations } from '@modelcontextprotocol/server';
import { registerSeleniumTools } from './domains/selenium/index.js';
import { registerCypressTools } from './domains/cypress/index.js';
import { registerVibiumTools } from './domains/vibium/index.js';
import { registerAppiumTools } from './domains/appium/index.js';
import { registerResources } from './resources/index.js';
import { registerPrompts } from './prompts/index.js';
import {
  SERVER_NAME,
  SERVER_VERSION,
  PROTOCOL_VERSION_2026_07_28,
  DEFAULT_DOCS_CACHE_TTL_MS,
  PUBLIC_CACHE_SCOPE,
} from './version.js';

export { PROTOCOL_VERSION_2026_07_28, DEFAULT_DOCS_CACHE_TTL_MS, PUBLIC_CACHE_SCOPE };

export interface CacheableResult {
  ttlMs?: number;
  cacheScope?: 'public' | 'private';
}

export interface ToolExecutionResult extends CacheableResult {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export function safeToolHandler<T>(
  handler: (args: T) => ToolExecutionResult | Promise<ToolExecutionResult>
): (args: T, extra?: unknown) => Promise<ToolExecutionResult> {
  return async (args: T): Promise<ToolExecutionResult> => {
    try {
      const result = await handler(args);
      return {
        ttlMs: DEFAULT_DOCS_CACHE_TTL_MS,
        cacheScope: PUBLIC_CACHE_SCOPE,
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
  const server = new McpServer(
    {
      name: SERVER_NAME,
      version: SERVER_VERSION,
    },
    {
      supportedProtocolVersions: [PROTOCOL_VERSION_2026_07_28],
      cacheHints: {
        'tools/list': { ttlMs: DEFAULT_DOCS_CACHE_TTL_MS, cacheScope: PUBLIC_CACHE_SCOPE },
        'prompts/list': { ttlMs: DEFAULT_DOCS_CACHE_TTL_MS, cacheScope: PUBLIC_CACHE_SCOPE },
        'resources/list': { ttlMs: DEFAULT_DOCS_CACHE_TTL_MS, cacheScope: PUBLIC_CACHE_SCOPE },
        'resources/templates/list': {
          ttlMs: DEFAULT_DOCS_CACHE_TTL_MS,
          cacheScope: PUBLIC_CACHE_SCOPE,
        },
        'server/discover': { ttlMs: DEFAULT_DOCS_CACHE_TTL_MS, cacheScope: PUBLIC_CACHE_SCOPE },
      },
      capabilities: {
        tools: { listChanged: false },
        resources: { subscribe: false, listChanged: false },
        prompts: { listChanged: false },
      },
    }
  );

  registerSeleniumTools(server, safeToolHandler, SAFE_READONLY_ANNOTATIONS);
  registerCypressTools(server, safeToolHandler, SAFE_READONLY_ANNOTATIONS);
  registerVibiumTools(server, safeToolHandler, SAFE_READONLY_ANNOTATIONS);
  registerAppiumTools(server, safeToolHandler, SAFE_READONLY_ANNOTATIONS);

  registerResources(server);
  registerPrompts(server);

  return server;
}

export { PUBLIC_CACHE_SCOPE as GLOBAL_CACHE_SCOPE } from './version.js';
