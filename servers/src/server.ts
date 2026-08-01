import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  handleCdpNetworkInterception,
  handleSeleniumWait,
  CdpNetworkInterceptionSchema,
  SeleniumWaitSchema,
} from '@/selenium/index.js';

export function createSdetMcpServer(): McpServer {
  const server = new McpServer({
    name: 'awesome-sdet-selenium-mcp',
    version: '1.0.0',
  });

  server.registerTool(
    'execute_selenium_wait',
    {
      description: 'Statelessly verifies a Selenium ExpectedConditions explicit wait condition',
      inputSchema: SeleniumWaitSchema.shape,
    },
    async (args) => handleSeleniumWait(args)
  );

  server.registerTool(
    'execute_cdp_network_interception',
    {
      description:
        'Statelessly configures or verifies Chrome DevTools Protocol (CDP) network request interception',
      inputSchema: CdpNetworkInterceptionSchema.shape,
    },
    async (args) => handleCdpNetworkInterception(args)
  );

  return server;
}
