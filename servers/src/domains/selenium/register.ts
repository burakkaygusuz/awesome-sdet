import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler, ToolExecutionResult } from '../../server.js';
import { DocsOutputSchema, extractStructuredDocs, SAFE_READONLY_ANNOTATIONS } from '../shared.js';
import {
  SeleniumDomainSchema,
  SupportedLanguageSchema,
  readSeleniumReferenceDoc,
} from './common.js';

export const SeleniumDocsArgsSchema = z.strictObject({
  domain: SeleniumDomainSchema,
  language: SupportedLanguageSchema,
});

export type SeleniumDocsArgs = z.infer<typeof SeleniumDocsArgsSchema>;

export async function handleSeleniumDocs(args: SeleniumDocsArgs): Promise<ToolExecutionResult> {
  const text = await readSeleniumReferenceDoc(args.domain, args.language);
  const structuredContent = extractStructuredDocs('selenium', args.domain, args.language, text);
  return {
    content: [{ type: 'text', text }],
    structuredContent,
  };
}

export function registerSeleniumTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  server.registerTool(
    'read_se_docs',
    {
      title: 'Selenium 4 Documentation & W3C Idioms',
      description:
        'Returns Selenium 4 API documentation, locator strategies, W3C Actions, BiDi interception, and Grid patterns.',
      inputSchema: SeleniumDocsArgsSchema,
      outputSchema: DocsOutputSchema,
      annotations,
    },
    safeHandler((args) => handleSeleniumDocs(args))
  );
}
