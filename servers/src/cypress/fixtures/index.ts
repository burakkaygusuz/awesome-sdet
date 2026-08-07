import { z } from 'zod';
import { readCypressReferenceDoc } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressFixturesDocsSchema = z.object({
  language: z
    .string()
    .default('typescript')
    .describe('Programming language for code examples (javascript or typescript)'),
});

export type CypressFixturesDocsArgs = z.infer<typeof CypressFixturesDocsSchema>;

export function handleCypressFixturesDocs(args: CypressFixturesDocsArgs): ToolExecutionResult {
  const language = args.language || 'typescript';
  const docs = readCypressReferenceDoc('fixtures', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
