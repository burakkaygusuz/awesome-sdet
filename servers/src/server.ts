import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/server';
import { registerPrompts } from './prompts/index.js';
import { registerResources } from './resources/index.js';
import { registerUniversalDocsGateway } from './tools/docs-gateway.js';
import { registerVerifyTool } from './tools/verify.js';

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
  structuredContent?: Record<string, unknown>;
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
      const errorId = randomUUID();
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(
        JSON.stringify({
          event: 'tool_execution_error',
          correlationId: errorId,
          message: errorMessage,
        })
      );

      const isClientValidationError =
        errorMessage.startsWith('Unsupported') ||
        errorMessage.startsWith('Invalid') ||
        errorMessage.startsWith('Domain is required') ||
        errorMessage.startsWith('Language is required');

      return {
        content: [
          {
            type: 'text' as const,
            text: isClientValidationError
              ? errorMessage
              : `Tool execution failed. Reference: ${errorId}`,
          },
        ],
        isError: true,
      };
    }
  };
}

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
        logging: {},
      },
    }
  );

  registerUniversalDocsGateway(server);
  registerVerifyTool(server);

  registerResources(server);
  registerPrompts(server);

  return server;
}

export { PUBLIC_CACHE_SCOPE as GLOBAL_CACHE_SCOPE } from './version.js';
export { SAFE_READONLY_ANNOTATIONS } from './domains/shared.js';
