import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import { registerSeleniumTools } from './selenium/index.js';
import { registerCypressTools } from './cypress/index.js';

export interface ToolExecutionResult {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

export function safeToolHandler<T>(
  handler: (args: T) => ToolExecutionResult | Promise<ToolExecutionResult>
) {
  return async (args: T): Promise<ToolExecutionResult> => {
    try {
      return await handler(args);
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
    name: 'sdet-mcp',
    version: '1.0.0',
  });

  // Framework Tool Registrations
  registerSeleniumTools(server, safeToolHandler, SAFE_READONLY_ANNOTATIONS);
  registerCypressTools(server, safeToolHandler, SAFE_READONLY_ANNOTATIONS);

  return server;
}
