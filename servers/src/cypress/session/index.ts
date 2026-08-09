import { z } from 'zod';
import { readCypressReferenceDoc, SupportedLanguageSchema } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressSessionDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type CypressSessionDocsArgs = z.infer<typeof CypressSessionDocsSchema>;

export async function handleCypressSessionDocs(
  args: CypressSessionDocsArgs
): Promise<ToolExecutionResult> {
  const language = args.language || 'typescript';
  const docs = await readCypressReferenceDoc('session', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
