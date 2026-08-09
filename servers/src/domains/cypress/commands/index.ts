import { z } from 'zod';
import { readCypressReferenceDoc, SupportedLanguageSchema } from '../common.js';
import type { ToolExecutionResult } from '../../../server.js';

export const CypressCommandsDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type CypressCommandsDocsArgs = z.infer<typeof CypressCommandsDocsSchema>;

export async function handleCypressCommandsDocs(
  args: CypressCommandsDocsArgs
): Promise<ToolExecutionResult> {
  const language = args.language || 'typescript';
  const docs = await readCypressReferenceDoc('commands', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
