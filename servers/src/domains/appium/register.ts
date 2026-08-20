import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler } from '../../server.js';
import { SAFE_READONLY_ANNOTATIONS, registerFrameworkTool } from '../shared.js';
import { AppiumDomainSchema, SupportedLanguageSchema, readAppiumReferenceDoc } from './common.js';

export const AppiumDocsArgsSchema = z.strictObject({
  domain: AppiumDomainSchema,
  language: SupportedLanguageSchema,
  query: z
    .string()
    .optional()
    .describe(
      'Optional keyword or symbol (e.g. "accessibilityId", "gestures", "context") to filter specific sections and code blocks'
    ),
});

export type AppiumDocsArgs = z.infer<typeof AppiumDocsArgsSchema>;

export function registerAppiumTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  registerFrameworkTool(
    server,
    safeHandler,
    {
      toolName: 'read_appium_docs',
      title: 'Appium Mobile Documentation & W3C Options',
      description:
        'Returns Appium 3.x API documentation, mobile locators, W3C touch gestures, and WebView context switching.',
      inputSchema: AppiumDocsArgsSchema,
      reader: readAppiumReferenceDoc,
      frameworkName: 'appium',
    },
    annotations
  );
}
