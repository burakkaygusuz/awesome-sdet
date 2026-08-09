import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { safeToolHandler } from '../server.js';
import {
  handleCypressCommandsDocs,
  handleCypressNetworkDocs,
  handleCypressSessionDocs,
  handleCypressShadowDocs,
  handleCypressComponentDocs,
  handleCypressTaskDocs,
  handleCypressStubsDocs,
  handleCypressFixturesDocs,
  CypressCommandsDocsSchema,
  CypressNetworkDocsSchema,
  CypressSessionDocsSchema,
  CypressShadowDocsSchema,
  CypressComponentDocsSchema,
  CypressTaskDocsSchema,
  CypressStubsDocsSchema,
  CypressFixturesDocsSchema,
} from './index.js';

export function registerCypressTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations
): void {
  server.registerTool(
    'read_cy_commands_docs',
    {
      title: 'Cypress Commands & Assertions Docs',
      description:
        'Returns Cypress core commands, DOM queries, and assertion code examples for a given language.',
      inputSchema: CypressCommandsDocsSchema,
      annotations,
    },
    safeHandler((args) => handleCypressCommandsDocs(args))
  );

  server.registerTool(
    'read_cy_network_docs',
    {
      title: 'Cypress Network Interception Docs',
      description:
        'Returns cy.intercept, cy.request, and API stubbing code examples for a given language.',
      inputSchema: CypressNetworkDocsSchema,
      annotations,
    },
    safeHandler((args) => handleCypressNetworkDocs(args))
  );

  server.registerTool(
    'read_cy_session_docs',
    {
      title: 'Cypress Session & Multi-Origin Docs',
      description:
        'Returns cy.session auth caching and cy.origin multi-domain testing code examples for a given language.',
      inputSchema: CypressSessionDocsSchema,
      annotations,
    },
    safeHandler((args) => handleCypressSessionDocs(args))
  );

  server.registerTool(
    'read_cy_shadow_docs',
    {
      title: 'Cypress Shadow DOM Docs',
      description:
        'Returns cy.shadow and Shadow DOM element traversal code examples for a given language.',
      inputSchema: CypressShadowDocsSchema,
      annotations,
    },
    safeHandler((args) => handleCypressShadowDocs(args))
  );

  server.registerTool(
    'read_cy_component_docs',
    {
      title: 'Cypress Component Testing Docs',
      description:
        'Returns Cypress component testing and mount API code examples for a given language.',
      inputSchema: CypressComponentDocsSchema,
      annotations,
    },
    safeHandler((args) => handleCypressComponentDocs(args))
  );

  server.registerTool(
    'read_cy_task_docs',
    {
      title: 'Cypress Node Task & OS Command Docs',
      description:
        'Returns cy.task Node.js event execution, database seeding, and cy.exec shell commands for a given language.',
      inputSchema: CypressTaskDocsSchema,
      annotations,
    },
    safeHandler((args) => handleCypressTaskDocs(args))
  );

  server.registerTool(
    'read_cy_stubs_spies_docs',
    {
      title: 'Cypress Stubs, Spies & Timers Docs',
      description:
        'Returns cy.stub, cy.spy, cy.clock, and cy.tick time manipulation code examples for a given language.',
      inputSchema: CypressStubsDocsSchema,
      annotations,
    },
    safeHandler((args) => handleCypressStubsDocs(args))
  );

  server.registerTool(
    'read_cy_fixtures_docs',
    {
      title: 'Cypress Fixtures & Viewport Docs',
      description:
        'Returns cy.fixture, cy.readFile, cy.writeFile, and cy.viewport emulation code examples for a given language.',
      inputSchema: CypressFixturesDocsSchema,
      annotations,
    },
    safeHandler((args) => handleCypressFixturesDocs(args))
  );
}
