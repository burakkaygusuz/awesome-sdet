import { z } from 'zod';
import { readCypressReferenceDoc, SupportedLanguageSchema } from '../common.js';
import type { ToolExecutionResult } from '../../../server.js';

export const CypressTaskDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type CypressTaskDocsArgs = z.infer<typeof CypressTaskDocsSchema>;

export async function handleCypressTaskDocs(
  args: CypressTaskDocsArgs
): Promise<ToolExecutionResult> {
  const language = args.language || 'typescript';
  const docs = await readCypressReferenceDoc('task', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
