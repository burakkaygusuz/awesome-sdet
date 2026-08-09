import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { safeToolHandler } from '../server.js';
import {
  handleSeleniumWait,
  handlePageFactoryDocs,
  handleLocatorDocs,
  handleBidiDocs,
  handleActionsDocs,
  handleListenersDocs,
  handleGridDocs,
  handleObservabilityDocs,
  SeleniumWaitSchema,
  PageFactoryDocsSchema,
  LocatorDocsSchema,
  BidiDocsSchema,
  ActionsDocsSchema,
  ListenersDocsSchema,
  GridDocsSchema,
  ObservabilityDocsSchema,
} from './index.js';

export function registerSeleniumTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations
): void {
  server.registerTool(
    'execute_se_explicit_wait',
    {
      title: 'Selenium Explicit Wait',
      description:
        'Validates a Selenium ExpectedConditions explicit wait configuration and returns the correct usage pattern.',
      inputSchema: SeleniumWaitSchema,
      annotations,
    },
    safeHandler(() => handleSeleniumWait())
  );

  server.registerTool(
    'read_se_pagefactory_docs',
    {
      title: 'Selenium PageFactory & POM Docs',
      description:
        'Returns PageFactory API reference and Page Object Model (POM) code examples for a given language.',
      inputSchema: PageFactoryDocsSchema,
      annotations,
    },
    safeHandler((args) => handlePageFactoryDocs(args))
  );

  server.registerTool(
    'read_se_locator_docs',
    {
      title: 'Selenium Locator Docs',
      description:
        'Returns locator strategy guide, performance hierarchy, best practices, and code examples for a given language.',
      inputSchema: LocatorDocsSchema,
      annotations,
    },
    safeHandler((args) => handleLocatorDocs(args))
  );

  server.registerTool(
    'read_se_bidi_docs',
    {
      title: 'Selenium BiDi Docs',
      description:
        'Returns W3C WebDriver BiDirectional (BiDi) protocol API reference and code examples for a given language.',
      inputSchema: BidiDocsSchema,
      annotations,
    },
    safeHandler((args) => handleBidiDocs(args))
  );

  server.registerTool(
    'read_se_actions_docs',
    {
      title: 'Selenium Actions API Docs',
      description:
        'Returns Actions API reference and code examples for low-level user interactions (mouse, keyboard, wheel) for a given language.',
      inputSchema: ActionsDocsSchema,
      annotations,
    },
    safeHandler((args) => handleActionsDocs(args))
  );

  server.registerTool(
    'read_se_listeners_docs',
    {
      title: 'Selenium Listeners Docs',
      description:
        'Returns EventFiringDecorator and WebDriverListener reference and code examples for event handling for a given language.',
      inputSchema: ListenersDocsSchema,
      annotations,
    },
    safeHandler((args) => handleListenersDocs(args))
  );

  server.registerTool(
    'read_se_grid_docs',
    {
      title: 'Selenium Grid & RemoteWebDriver Docs',
      description:
        'Returns RemoteWebDriver API reference, Grid 4 capabilities, remote file download, custom TOML stereotypes, and cloud grid configuration for a given language.',
      inputSchema: GridDocsSchema,
      annotations,
    },
    safeHandler((args) => handleGridDocs(args))
  );

  server.registerTool(
    'read_se_observability_docs',
    {
      title: 'Selenium Observability & OpenTelemetry Docs',
      description:
        'Returns OpenTelemetry tracing configuration and Grid 4 GraphQL API metrics querying code examples for a given language.',
      inputSchema: ObservabilityDocsSchema,
      annotations,
    },
    safeHandler((args) => handleObservabilityDocs(args))
  );
}
