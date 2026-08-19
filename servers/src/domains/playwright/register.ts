import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler, ToolExecutionResult } from '../../server.js';
import { DocsOutputSchema, extractStructuredDocs, SAFE_READONLY_ANNOTATIONS } from '../shared.js';
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

export async function handlePlaywrightDocs(args: PlaywrightDocsArgs): Promise<ToolExecutionResult> {
  const text = await readPlaywrightReferenceDoc(args.domain, args.language);
  const structuredContent = extractStructuredDocs('playwright', args.domain, args.language, text);
  return {
    content: [{ type: 'text', text }],
    structuredContent,
  };
}

export function registerPlaywrightTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  server.registerTool(
    'read_pw_docs',
    {
      title: 'Playwright Documentation & Idioms',
      description:
        'Returns Playwright API documentation, locator strategies, auto-waiting actions, assertions, and network patterns.',
      inputSchema: PlaywrightDocsArgsSchema,
      outputSchema: DocsOutputSchema,
      annotations,
    },
    safeHandler((args) => handlePlaywrightDocs(args))
  );
}
