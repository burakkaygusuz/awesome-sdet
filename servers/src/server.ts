import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import {
  handleSeleniumWait,
  handlePageFactoryDocs,
  handleLocatorDocs,
  handleBidiDocs,
  handleActionsDocs,
  handleListenersDocs,
  handleGridDocs,
  SeleniumWaitSchema,
  PageFactoryDocsSchema,
  LocatorDocsSchema,
  BidiDocsSchema,
  ActionsDocsSchema,
  ListenersDocsSchema,
  GridDocsSchema,
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

const SAFE_READONLY_ANNOTATIONS: ToolAnnotations = {
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

  server.registerTool(
    'execute_se_explicit_wait',
    {
      title: 'Selenium Explicit Wait',
      description:
        'Validates a Selenium ExpectedConditions explicit wait configuration and returns the correct usage pattern.',
      inputSchema: SeleniumWaitSchema.shape,
      annotations: SAFE_READONLY_ANNOTATIONS,
    },
    safeToolHandler(() => handleSeleniumWait())
  );

  server.registerTool(
    'read_se_pagefactory_docs',
    {
      title: 'Selenium PageFactory & POM Docs',
      description:
        'Returns PageFactory API reference and Page Object Model (POM) code examples for a given language.',
      inputSchema: PageFactoryDocsSchema.shape,
      annotations: SAFE_READONLY_ANNOTATIONS,
    },
    safeToolHandler((args) => handlePageFactoryDocs(args))
  );

  server.registerTool(
    'read_se_locator_docs',
    {
      title: 'Selenium Locator Docs',
      description:
        'Returns locator strategy guide, performance hierarchy, best practices, and code examples for a given language.',
      inputSchema: LocatorDocsSchema.shape,
      annotations: SAFE_READONLY_ANNOTATIONS,
    },
    safeToolHandler((args) => handleLocatorDocs(args))
  );

  server.registerTool(
    'read_se_bidi_docs',
    {
      title: 'Selenium BiDi Docs',
      description:
        'Returns W3C WebDriver BiDirectional (BiDi) protocol API reference and code examples for a given language.',
      inputSchema: BidiDocsSchema.shape,
      annotations: SAFE_READONLY_ANNOTATIONS,
    },
    safeToolHandler((args) => handleBidiDocs(args))
  );

  server.registerTool(
    'read_se_actions_docs',
    {
      title: 'Selenium Actions API Docs',
      description:
        'Returns Actions API reference and code examples for low-level user interactions (mouse, keyboard, wheel) for a given language.',
      inputSchema: ActionsDocsSchema.shape,
      annotations: SAFE_READONLY_ANNOTATIONS,
    },
    safeToolHandler((args) => handleActionsDocs(args))
  );

  server.registerTool(
    'read_se_listeners_docs',
    {
      title: 'Selenium Listeners Docs',
      description:
        'Returns EventFiringDecorator and WebDriverListener reference and code examples for event handling for a given language.',
      inputSchema: ListenersDocsSchema.shape,
      annotations: SAFE_READONLY_ANNOTATIONS,
    },
    safeToolHandler((args) => handleListenersDocs(args))
  );

  server.registerTool(
    'read_se_grid_docs',
    {
      title: 'Selenium Grid & RemoteWebDriver Docs',
      description:
        'Returns RemoteWebDriver API reference, Grid 4 capabilities, remote file download, custom TOML stereotypes, and cloud grid configuration for a given language.',
      inputSchema: GridDocsSchema.shape,
      annotations: SAFE_READONLY_ANNOTATIONS,
    },
    safeToolHandler((args) => handleGridDocs(args))
  );

  return server;
}
