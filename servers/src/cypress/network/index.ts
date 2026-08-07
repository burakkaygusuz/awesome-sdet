import { z } from 'zod';
import { readCypressReferenceDoc } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressNetworkDocsSchema = z.object({
  language: z
    .string()
    .default('typescript')
    .describe('Programming language for code examples (javascript or typescript)'),
});

export type CypressNetworkDocsArgs = z.infer<typeof CypressNetworkDocsSchema>;

export function handleCypressNetworkDocs(args: CypressNetworkDocsArgs): ToolExecutionResult {
  const language = args.language || 'typescript';
  const docs = readCypressReferenceDoc('network', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
