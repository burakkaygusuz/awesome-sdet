import { z } from 'zod';
import { readCypressReferenceDoc, SupportedLanguageSchema } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressNetworkDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type CypressNetworkDocsArgs = z.infer<typeof CypressNetworkDocsSchema>;

export async function handleCypressNetworkDocs(
  args: CypressNetworkDocsArgs
): Promise<ToolExecutionResult> {
  const language = args.language || 'typescript';
  const docs = await readCypressReferenceDoc('network', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
