import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  handleCdpNetworkInterception,
  handleSeleniumWait,
  handlePageFactoryDocs,
  handleLocatorDocs,
  CdpNetworkInterceptionSchema,
  SeleniumWaitSchema,
  PageFactoryDocsSchema,
  LocatorDocsSchema,
} from './selenium/index.js';

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

export function createMcpServer(): McpServer {
  const server = new McpServer({
    name: 'sdet-mcp',
    version: '1.0.0',
  });

  server.registerTool(
    'execute_se_explicit_wait',
    {
      description:
        'Statelessly validates and reports requests for a Selenium ExpectedConditions explicit wait without executing a browser',
      inputSchema: SeleniumWaitSchema.shape,
    },
    safeToolHandler(() => handleSeleniumWait())
  );

  server.registerTool(
    'execute_se_cdp_intercept',
    {
      description:
        'Statelessly validates and reports requests for Chrome DevTools Protocol (CDP) network request interception without executing a browser',
      inputSchema: CdpNetworkInterceptionSchema.shape,
    },
    safeToolHandler(() => handleCdpNetworkInterception())
  );

  server.registerTool(
    'read_pagefactory_docs',
    {
      description:
        'Looks up complete API references for Selenium PageFactory, annotations, and multi-language Page Object Model (POM) patterns (Java, Python, TypeScript, JavaScript, C#, Ruby)',
      inputSchema: PageFactoryDocsSchema.shape,
    },
    safeToolHandler((args) => handlePageFactoryDocs(args))
  );

  server.registerTool(
    'read_se_locator_docs',
    {
      description:
        'Looks up complete Selenium locator strategy guides, performance hierarchies, best practices, and multi-language code examples (Java, Python, TypeScript, JavaScript, C#, Ruby)',
      inputSchema: LocatorDocsSchema.shape,
    },
    safeToolHandler((args) => handleLocatorDocs(args))
  );

  return server;
}
