import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler } from '../../server.js';
import { SAFE_READONLY_ANNOTATIONS, registerFrameworkTool } from '../shared.js';
import { CypressDomainSchema, SupportedLanguageSchema, readCypressReferenceDoc } from './common.js';

export const CypressDocsArgsSchema = z.strictObject({
  domain: CypressDomainSchema,
  language: SupportedLanguageSchema,
  query: z
    .string()
    .optional()
    .describe(
      'Optional keyword or symbol (e.g. "cy.intercept", "cy.origin", "session") to filter specific sections and code blocks'
    ),
});

export type CypressDocsArgs = z.infer<typeof CypressDocsArgsSchema>;

export function registerCypressTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  registerFrameworkTool(
    server,
    safeHandler,
    {
      toolName: 'read_cy_docs',
      title: 'Cypress Documentation & Command Queue Idioms',
      description:
        'Returns Cypress API documentation, command chaining, network interception, sessions, and component tests.',
      inputSchema: CypressDocsArgsSchema,
      reader: readCypressReferenceDoc,
      frameworkName: 'cypress',
    },
    annotations
  );
}
