import { z } from 'zod';
import { readCypressReferenceDoc, SupportedLanguageSchema } from '../common.js';
import type { ToolExecutionResult } from '../../../server.js';

export const CypressStubsDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type CypressStubsDocsArgs = z.infer<typeof CypressStubsDocsSchema>;

export async function handleCypressStubsDocs(
  args: CypressStubsDocsArgs
): Promise<ToolExecutionResult> {
  const language = args.language || 'typescript';
  const docs = await readCypressReferenceDoc('stubs', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
