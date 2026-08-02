import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  handleCdpNetworkInterception,
  handleSeleniumWait,
  handlePageFactoryDocs,
  CdpNetworkInterceptionSchema,
  SeleniumWaitSchema,
  PageFactoryDocsSchema,
} from './selenium/index.js';

export function createSdetMcpServer(): McpServer {
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
    async () => handleSeleniumWait()
  );

  server.registerTool(
    'execute_se_cdp_intercept',
    {
      description:
        'Statelessly validates and reports requests for Chrome DevTools Protocol (CDP) network request interception without executing a browser',
      inputSchema: CdpNetworkInterceptionSchema.shape,
    },
    async () => handleCdpNetworkInterception()
  );

  server.registerTool(
    'read_pagefactory_docs',
    {
      description:
        'Looks up complete API references for Selenium PageFactory, annotations, and locator factories',
      inputSchema: PageFactoryDocsSchema.shape,
    },
    async (args) => handlePageFactoryDocs(args)
  );

  return server;
}
