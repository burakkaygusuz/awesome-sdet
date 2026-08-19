import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler, ToolExecutionResult } from '../../server.js';
import { DocsOutputSchema, extractStructuredDocs, SAFE_READONLY_ANNOTATIONS } from '../shared.js';
import { CypressDomainSchema, SupportedLanguageSchema, readCypressReferenceDoc } from './common.js';

export const CypressDocsArgsSchema = z.strictObject({
  domain: CypressDomainSchema,
  language: SupportedLanguageSchema,
});

export type CypressDocsArgs = z.infer<typeof CypressDocsArgsSchema>;

export async function handleCypressDocs(args: CypressDocsArgs): Promise<ToolExecutionResult> {
  const text = await readCypressReferenceDoc(args.domain, args.language);
  const structuredContent = extractStructuredDocs('cypress', args.domain, args.language, text);
  return {
    content: [{ type: 'text', text }],
    structuredContent,
  };
}

export function registerCypressTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  server.registerTool(
    'read_cy_docs',
    {
      title: 'Cypress Documentation & Command Queue Idioms',
      description:
        'Returns Cypress API documentation, command chaining, network interception, sessions, and component tests.',
      inputSchema: CypressDocsArgsSchema,
      outputSchema: DocsOutputSchema,
      annotations,
    },
    safeHandler((args) => handleCypressDocs(args))
  );
}
