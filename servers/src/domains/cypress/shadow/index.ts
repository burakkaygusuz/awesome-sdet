import { z } from 'zod';
import { readCypressReferenceDoc, SupportedLanguageSchema } from '../common.js';
import type { ToolExecutionResult } from '../../../server.js';

export const CypressShadowDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type CypressShadowDocsArgs = z.infer<typeof CypressShadowDocsSchema>;

export async function handleCypressShadowDocs(
  args: CypressShadowDocsArgs
): Promise<ToolExecutionResult> {
  const language = args.language || 'typescript';
  const docs = await readCypressReferenceDoc('shadow', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
