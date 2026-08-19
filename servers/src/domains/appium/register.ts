import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler, ToolExecutionResult } from '../../server.js';
import { DocsOutputSchema, extractStructuredDocs, SAFE_READONLY_ANNOTATIONS } from '../shared.js';
import { AppiumDomainSchema, SupportedLanguageSchema, readAppiumReferenceDoc } from './common.js';

export const AppiumDocsArgsSchema = z.strictObject({
  domain: AppiumDomainSchema,
  language: SupportedLanguageSchema,
});

export type AppiumDocsArgs = z.infer<typeof AppiumDocsArgsSchema>;

export async function handleAppiumDocs(args: AppiumDocsArgs): Promise<ToolExecutionResult> {
  const text = await readAppiumReferenceDoc(args.domain, args.language);
  const structuredContent = extractStructuredDocs('appium', args.domain, args.language, text);
  return {
    content: [{ type: 'text', text }],
    structuredContent,
  };
}

export function registerAppiumTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  server.registerTool(
    'read_appium_docs',
    {
      title: 'Appium Mobile Documentation & W3C Options',
      description:
        'Returns Appium 3.x API documentation, mobile locators, W3C touch gestures, and WebView context switching.',
      inputSchema: AppiumDocsArgsSchema,
      outputSchema: DocsOutputSchema,
      annotations,
    },
    safeHandler((args) => handleAppiumDocs(args))
  );
}
