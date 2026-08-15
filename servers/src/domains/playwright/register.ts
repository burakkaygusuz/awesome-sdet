import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import type { safeToolHandler } from '../../server.js';
import { SAFE_READONLY_ANNOTATIONS } from '../shared.js';
import {
  handlePlaywrightLocatorsDocs,
  handlePlaywrightActionsDocs,
  handlePlaywrightAssertionsDocs,
  handlePlaywrightNetworkDocs,
  handlePlaywrightStorageDocs,
  handlePlaywrightObservabilityDocs,
  PlaywrightLocatorsDocsSchema,
  PlaywrightActionsDocsSchema,
  PlaywrightAssertionsDocsSchema,
  PlaywrightNetworkDocsSchema,
  PlaywrightStorageDocsSchema,
  PlaywrightObservabilityDocsSchema,
} from './index.js';

export function registerPlaywrightTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  server.registerTool(
    'read_pw_locators_docs',
    {
      title: 'Playwright Locators & Selectors',
      description:
        'Returns Playwright user-facing locator strategies (getByRole, getByText, getByTestId), filtering, and chaining reference.',
      inputSchema: PlaywrightLocatorsDocsSchema,
      annotations,
    },
    safeHandler((args) => handlePlaywrightLocatorsDocs(args))
  );

  server.registerTool(
    'read_pw_actions_docs',
    {
      title: 'Playwright Actions & Auto-Waiting',
      description:
        'Returns Playwright actionability checks, auto-waiting, click, fill, type, selectOption, dragTo, and file upload reference.',
      inputSchema: PlaywrightActionsDocsSchema,
      annotations,
    },
    safeHandler((args) => handlePlaywrightActionsDocs(args))
  );

  server.registerTool(
    'read_pw_assertions_docs',
    {
      title: 'Playwright Web-First Assertions',
      description:
        'Returns Playwright auto-retrying web-first assertions (expect(locator).toBeVisible(), toHaveText(), toHaveValue(), toPass()) reference.',
      inputSchema: PlaywrightAssertionsDocsSchema,
      annotations,
    },
    safeHandler((args) => handlePlaywrightAssertionsDocs(args))
  );

  server.registerTool(
    'read_pw_network_docs',
    {
      title: 'Playwright Network Mocking & API Testing',
      description:
        'Returns Playwright request interception (page.route(), route.fulfill(), route.abort()), HAR replay, and APIRequestContext reference.',
      inputSchema: PlaywrightNetworkDocsSchema,
      annotations,
    },
    safeHandler((args) => handlePlaywrightNetworkDocs(args))
  );

  server.registerTool(
    'read_pw_storage_docs',
    {
      title: 'Playwright Storage State & Authentication',
      description:
        'Returns Playwright authentication state persistence (storageState.json), multi-role fixtures, and browser context isolation reference.',
      inputSchema: PlaywrightStorageDocsSchema,
      annotations,
    },
    safeHandler((args) => handlePlaywrightStorageDocs(args))
  );

  server.registerTool(
    'read_pw_observability_docs',
    {
      title: 'Playwright Observability & Tracing',
      description:
        'Returns Playwright tracing (context.tracing.start/stop), trace viewer artifacts, video recording, screenshots, and visual regression (toHaveScreenshot()) reference.',
      inputSchema: PlaywrightObservabilityDocsSchema,
      annotations,
    },
    safeHandler((args) => handlePlaywrightObservabilityDocs(args))
  );
}
