import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler, ToolExecutionResult } from '../../server.js';
import { SAFE_READONLY_ANNOTATIONS } from '../shared.js';
import {
  PLAYWRIGHT_DOMAINS,
  PLAYWRIGHT_SUPPORTED_LANGUAGES,
  readPlaywrightReferenceDoc,
} from './common.js';

export const PlaywrightDocsArgsSchema = z
  .object({
    domain: z
      .enum(PLAYWRIGHT_DOMAINS)
      .describe(
        'Playwright domain: actions, assertions, locators, network, observability, storage'
      ),
    language: z
      .enum(PLAYWRIGHT_SUPPORTED_LANGUAGES)
      .default('typescript')
      .describe(
        'Target language: typescript, javascript, python, java, csharp. Defaults to typescript.'
      ),
  })
  .strict();

export type PlaywrightDocsArgs = z.infer<typeof PlaywrightDocsArgsSchema>;

export async function handlePlaywrightDocs(args: PlaywrightDocsArgs): Promise<ToolExecutionResult> {
  const text = await readPlaywrightReferenceDoc(args.domain, args.language);
  return {
    content: [{ type: 'text', text }],
  };
}

export function registerPlaywrightTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  server.registerTool(
    'read_pw_docs',
    {
      title: 'Playwright Documentation & Idioms',
      description:
        'Returns Playwright API documentation, locator strategies, auto-waiting actions, assertions, and network patterns.',
      inputSchema: PlaywrightDocsArgsSchema,
      annotations,
    },
    safeHandler((args) => handlePlaywrightDocs(args))
  );
}
