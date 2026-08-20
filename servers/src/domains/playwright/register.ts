import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler } from '../../server.js';
import { SAFE_READONLY_ANNOTATIONS, registerFrameworkTool } from '../shared.js';
import {
  PlaywrightDomainSchema,
  SupportedLanguageSchema,
  readPlaywrightReferenceDoc,
} from './common.js';

export const PlaywrightDocsArgsSchema = z.strictObject({
  domain: PlaywrightDomainSchema,
  language: SupportedLanguageSchema,
});

export type PlaywrightDocsArgs = z.infer<typeof PlaywrightDocsArgsSchema>;

export function registerPlaywrightTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  registerFrameworkTool(
    server,
    safeHandler,
    {
      toolName: 'read_pw_docs',
      title: 'Playwright Documentation & Idioms',
      description:
        'Returns Playwright API documentation, locator strategies, auto-waiting actions, assertions, and network patterns.',
      inputSchema: PlaywrightDocsArgsSchema,
      reader: readPlaywrightReferenceDoc,
      frameworkName: 'playwright',
    },
    annotations
  );
}
