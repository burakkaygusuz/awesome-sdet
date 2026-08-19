import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler, ToolExecutionResult } from '../../server.js';
import { DocsOutputSchema, extractStructuredDocs, SAFE_READONLY_ANNOTATIONS } from '../shared.js';
import { VibiumDomainSchema, SupportedLanguageSchema, readVibiumReferenceDoc } from './common.js';

export const VibiumDocsArgsSchema = z.strictObject({
  domain: VibiumDomainSchema,
  language: SupportedLanguageSchema,
});

export type VibiumDocsArgs = z.infer<typeof VibiumDocsArgsSchema>;

export async function handleVibiumDocs(args: VibiumDocsArgs): Promise<ToolExecutionResult> {
  const text = await readVibiumReferenceDoc(args.domain, args.language);
  const structuredContent = extractStructuredDocs('vibium', args.domain, args.language, text);
  return {
    content: [{ type: 'text', text }],
    structuredContent,
  };
}

export function registerVibiumTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  server.registerTool(
    'read_vibium_docs',
    {
      title: 'Vibium Documentation & AI-Native BiDi Idioms',
      description:
        'Returns Vibium API documentation, semantic selectors, BiDi routing, and Sense-Think-Act agent loop patterns.',
      inputSchema: VibiumDocsArgsSchema,
      outputSchema: DocsOutputSchema,
      annotations,
    },
    safeHandler((args) => handleVibiumDocs(args))
  );
}
