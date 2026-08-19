import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler, ToolExecutionResult } from '../../server.js';
import { SAFE_READONLY_ANNOTATIONS } from '../shared.js';
import { CYPRESS_DOMAINS, CYPRESS_SUPPORTED_LANGUAGES, readCypressReferenceDoc } from './common.js';

export const CypressDocsArgsSchema = z
  .object({
    domain: z
      .enum(CYPRESS_DOMAINS)
      .describe(
        'Cypress domain: commands, component, fixtures, network, session, shadow, stubs, task'
      ),
    language: z
      .enum(CYPRESS_SUPPORTED_LANGUAGES)
      .default('typescript')
      .describe('Target language: typescript or javascript. Defaults to typescript.'),
  })
  .strict();

export type CypressDocsArgs = z.infer<typeof CypressDocsArgsSchema>;

export async function handleCypressDocs(args: CypressDocsArgs): Promise<ToolExecutionResult> {
  const text = await readCypressReferenceDoc(args.domain, args.language);
  return {
    content: [{ type: 'text', text }],
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
      annotations,
    },
    safeHandler((args) => handleCypressDocs(args))
  );
}
