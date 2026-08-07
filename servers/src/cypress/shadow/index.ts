import { z } from 'zod';
import { readCypressReferenceDoc } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressShadowDocsSchema = z.object({
  language: z
    .string()
    .default('typescript')
    .describe('Programming language for code examples (javascript or typescript)'),
});

export type CypressShadowDocsArgs = z.infer<typeof CypressShadowDocsSchema>;

export function handleCypressShadowDocs(args: CypressShadowDocsArgs): ToolExecutionResult {
  const language = args.language || 'typescript';
  const docs = readCypressReferenceDoc('shadow', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
