import { z } from 'zod';
import { readCypressReferenceDoc } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressComponentDocsSchema = z.object({
  language: z
    .string()
    .default('typescript')
    .describe('Programming language for code examples (javascript or typescript)'),
});

export type CypressComponentDocsArgs = z.infer<typeof CypressComponentDocsSchema>;

export function handleCypressComponentDocs(args: CypressComponentDocsArgs): ToolExecutionResult {
  const language = args.language || 'typescript';
  const docs = readCypressReferenceDoc('component', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
