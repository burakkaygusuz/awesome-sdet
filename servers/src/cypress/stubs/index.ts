import { z } from 'zod';
import { readCypressReferenceDoc } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressStubsDocsSchema = z.object({
  language: z
    .string()
    .default('typescript')
    .describe('Programming language for code examples (javascript or typescript)'),
});

export type CypressStubsDocsArgs = z.infer<typeof CypressStubsDocsSchema>;

export function handleCypressStubsDocs(args: CypressStubsDocsArgs): ToolExecutionResult {
  const language = args.language || 'typescript';
  const docs = readCypressReferenceDoc('stubs', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
