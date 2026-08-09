import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ToolAnnotations } from '@modelcontextprotocol/sdk/types.js';
import type { safeToolHandler } from '../server.js';
import {
  handleVibiumCoreDocs,
  handleVibiumSelectorsDocs,
  handleVibiumInteractionsDocs,
  handleVibiumBidiDocs,
  handleVibiumStateDocs,
  VibiumCoreDocsSchema,
  VibiumSelectorsDocsSchema,
  VibiumInteractionsDocsSchema,
  VibiumBidiDocsSchema,
  VibiumStateDocsSchema,
} from './index.js';

export function registerVibiumTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations
): void {
  server.registerTool(
    'read_vibium_core_docs',
    {
      title: 'Vibium Core & CLI Docs',
      description:
        'Returns Vibium browser lifecycle, launch options, and Sense-Think-Act CLI/SDK/MCP architecture reference.',
      inputSchema: VibiumCoreDocsSchema,
      annotations,
    },
    safeHandler((args) => handleVibiumCoreDocs(args))
  );

  server.registerTool(
    'read_vibium_selectors_docs',
    {
      title: 'Vibium Selectors & Locators',
      description:
        'Returns Vibium semantic locator strategies, pierce combinators (>>, >>>), and scoping reference for target language.',
      inputSchema: VibiumSelectorsDocsSchema,
      annotations,
    },
    safeHandler((args) => handleVibiumSelectorsDocs(args))
  );

  server.registerTool(
    'read_vibium_interactions_docs',
    {
      title: 'Vibium Interactions & Actionability',
      description:
        'Returns Vibium auto-waiting actionability, click, fill, type, select, hover, and drag interaction reference.',
      inputSchema: VibiumInteractionsDocsSchema,
      annotations,
    },
    safeHandler((args) => handleVibiumInteractionsDocs(args))
  );

  server.registerTool(
    'read_vibium_bidi_docs',
    {
      title: 'Vibium BiDi & Network Routing',
      description:
        'Returns WebDriver BiDi protocol, page.route network mocking, console/error listeners, and clock virtualization.',
      inputSchema: VibiumBidiDocsSchema,
      annotations,
    },
    safeHandler((args) => handleVibiumBidiDocs(args))
  );

  server.registerTool(
    'read_vibium_state_docs',
    {
      title: 'Vibium State & Recording Docs',
      description:
        'Returns Vibium storage state/auth snapshots, session tracing, video recording, and multi-tab contexts reference.',
      inputSchema: VibiumStateDocsSchema,
      annotations,
    },
    safeHandler((args) => handleVibiumStateDocs(args))
  );
}
