import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler, ToolExecutionResult } from '../../server.js';
import { SAFE_READONLY_ANNOTATIONS } from '../shared.js';
import { APPIUM_DOMAINS, APPIUM_SUPPORTED_LANGUAGES, readAppiumReferenceDoc } from './common.js';

export const AppiumDocsArgsSchema = z
  .object({
    domain: z
      .enum(APPIUM_DOMAINS)
      .describe('Appium domain: capabilities, context, device, gestures, locators'),
    language: z
      .enum(APPIUM_SUPPORTED_LANGUAGES)
      .default('typescript')
      .describe(
        'Target language: typescript, javascript, python, java, csharp. Defaults to typescript.'
      ),
  })
  .strict();

export type AppiumDocsArgs = z.infer<typeof AppiumDocsArgsSchema>;

export async function handleAppiumDocs(args: AppiumDocsArgs): Promise<ToolExecutionResult> {
  const text = await readAppiumReferenceDoc(args.domain, args.language);
  return {
    content: [{ type: 'text', text }],
  };
}

export function registerAppiumTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  server.registerTool(
    'read_appium_docs',
    {
      title: 'Appium Mobile Documentation & W3C Options',
      description:
        'Returns Appium 3.x API documentation, mobile locators, W3C touch gestures, and WebView context switching.',
      inputSchema: AppiumDocsArgsSchema,
      annotations,
    },
    safeHandler((args) => handleAppiumDocs(args))
  );
}
