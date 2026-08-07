import { z } from 'zod';
import { readCypressReferenceDoc } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressCommandsDocsSchema = z.object({
  language: z
    .string()
    .default('typescript')
    .describe('Programming language for code examples (javascript or typescript)'),
});

export type CypressCommandsDocsArgs = z.infer<typeof CypressCommandsDocsSchema>;

export function handleCypressCommandsDocs(args: CypressCommandsDocsArgs): ToolExecutionResult {
  const language = args.language || 'typescript';
  const docs = readCypressReferenceDoc('commands', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
