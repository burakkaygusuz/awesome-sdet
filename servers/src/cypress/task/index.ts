import { z } from 'zod';
import { readCypressReferenceDoc } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressTaskDocsSchema = z.object({
  language: z
    .string()
    .default('typescript')
    .describe('Programming language for code examples (javascript or typescript)'),
});

export type CypressTaskDocsArgs = z.infer<typeof CypressTaskDocsSchema>;

export function handleCypressTaskDocs(args: CypressTaskDocsArgs): ToolExecutionResult {
  const language = args.language || 'typescript';
  const docs = readCypressReferenceDoc('task', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
