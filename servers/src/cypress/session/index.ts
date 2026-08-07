import { z } from 'zod';
import { readCypressReferenceDoc } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressSessionDocsSchema = z.object({
  language: z
    .string()
    .default('typescript')
    .describe('Programming language for code examples (javascript or typescript)'),
});

export type CypressSessionDocsArgs = z.infer<typeof CypressSessionDocsSchema>;

export function handleCypressSessionDocs(args: CypressSessionDocsArgs): ToolExecutionResult {
  const language = args.language || 'typescript';
  const docs = readCypressReferenceDoc('session', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
