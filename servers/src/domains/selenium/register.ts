import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler, ToolExecutionResult } from '../../server.js';
import { SAFE_READONLY_ANNOTATIONS } from '../shared.js';
import {
  SELENIUM_DOMAINS,
  SELENIUM_SUPPORTED_LANGUAGES,
  readSeleniumReferenceDoc,
} from './common.js';

export const SeleniumDocsArgsSchema = z
  .object({
    domain: z
      .enum(SELENIUM_DOMAINS)
      .describe(
        'Selenium domain: actions, bidi, grid, listeners, locators, observability, pagefactory'
      ),
    language: z
      .enum(SELENIUM_SUPPORTED_LANGUAGES)
      .default('typescript')
      .describe(
        'Target language: typescript, javascript, python, java, csharp, ruby. Defaults to typescript.'
      ),
  })
  .strict();

export type SeleniumDocsArgs = z.infer<typeof SeleniumDocsArgsSchema>;

export async function handleSeleniumDocs(args: SeleniumDocsArgs): Promise<ToolExecutionResult> {
  const text = await readSeleniumReferenceDoc(args.domain, args.language);
  return {
    content: [{ type: 'text', text }],
  };
}

export function registerSeleniumTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  server.registerTool(
    'read_se_docs',
    {
      title: 'Selenium 4 Documentation & W3C Idioms',
      description:
        'Returns Selenium 4 API documentation, locator strategies, W3C Actions, BiDi interception, and Grid patterns.',
      inputSchema: SeleniumDocsArgsSchema,
      annotations,
    },
    safeHandler((args) => handleSeleniumDocs(args))
  );
}
