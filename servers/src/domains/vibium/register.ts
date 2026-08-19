import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler, ToolExecutionResult } from '../../server.js';
import { SAFE_READONLY_ANNOTATIONS } from '../shared.js';
import { VIBIUM_DOMAINS, VIBIUM_SUPPORTED_LANGUAGES, readVibiumReferenceDoc } from './common.js';

export const VibiumDocsArgsSchema = z
  .object({
    domain: z
      .enum(VIBIUM_DOMAINS)
      .describe('Vibium domain: bidi, core, interactions, selectors, state'),
    language: z
      .enum(VIBIUM_SUPPORTED_LANGUAGES)
      .default('typescript')
      .describe('Target language: typescript, javascript, python, java. Defaults to typescript.'),
  })
  .strict();

export type VibiumDocsArgs = z.infer<typeof VibiumDocsArgsSchema>;

export async function handleVibiumDocs(args: VibiumDocsArgs): Promise<ToolExecutionResult> {
  const text = await readVibiumReferenceDoc(args.domain, args.language);
  return {
    content: [{ type: 'text', text }],
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
      annotations,
    },
    safeHandler((args) => handleVibiumDocs(args))
  );
}
