import { z } from 'zod';
import { readCypressReferenceDoc, SupportedLanguageSchema } from '../common.js';
import type { ToolExecutionResult } from '../../../server.js';

export const CypressComponentDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type CypressComponentDocsArgs = z.infer<typeof CypressComponentDocsSchema>;

export async function handleCypressComponentDocs(
  args: CypressComponentDocsArgs
): Promise<ToolExecutionResult> {
  const language = args.language || 'typescript';
  const docs = await readCypressReferenceDoc('component', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
