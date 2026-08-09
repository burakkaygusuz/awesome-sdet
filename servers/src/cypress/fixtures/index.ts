import { z } from 'zod';
import { readCypressReferenceDoc, SupportedLanguageSchema } from '../common.js';
import type { ToolExecutionResult } from '../../server.js';

export const CypressFixturesDocsSchema = z
  .object({
    language: SupportedLanguageSchema,
  })
  .strict();

export type CypressFixturesDocsArgs = z.infer<typeof CypressFixturesDocsSchema>;

export async function handleCypressFixturesDocs(
  args: CypressFixturesDocsArgs
): Promise<ToolExecutionResult> {
  const language = args.language || 'typescript';
  const docs = await readCypressReferenceDoc('fixtures', language);

  return {
    content: [{ type: 'text', text: docs }],
  };
}
