import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  handleCdpNetworkInterception,
  handleSeleniumWait,
  CdpNetworkInterceptionSchema,
  SeleniumWaitSchema,
} from './selenium/index.js';

export function createSdetMcpServer(): McpServer {
  const server = new McpServer({
    name: 'awesome-sdet-selenium-mcp',
    version: '1.0.0',
  });

  server.registerTool(
    'execute_selenium_wait',
    {
      description:
        'Statelessly validates and reports requests for a Selenium ExpectedConditions explicit wait without executing a browser',
      inputSchema: SeleniumWaitSchema.shape,
    },
    async () => handleSeleniumWait()
  );

  server.registerTool(
    'execute_cdp_network_interception',
    {
      description:
        'Statelessly validates and reports requests for Chrome DevTools Protocol (CDP) network request interception without executing a browser',
      inputSchema: CdpNetworkInterceptionSchema.shape,
    },
    async () => handleCdpNetworkInterception()
  );

  return server;
}
