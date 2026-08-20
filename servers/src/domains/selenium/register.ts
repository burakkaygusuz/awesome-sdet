import type { McpServer, ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';
import type { safeToolHandler } from '../../server.js';
import { SAFE_READONLY_ANNOTATIONS, registerFrameworkTool } from '../shared.js';
import {
  SeleniumDomainSchema,
  SupportedLanguageSchema,
  readSeleniumReferenceDoc,
} from './common.js';

export const SeleniumDocsArgsSchema = z.strictObject({
  domain: SeleniumDomainSchema,
  language: SupportedLanguageSchema,
  query: z
    .string()
    .optional()
    .describe(
      'Optional keyword or symbol (e.g. "By.cssSelector", "BiDi", "WebDriverWait") to filter specific sections and code blocks'
    ),
});

export type SeleniumDocsArgs = z.infer<typeof SeleniumDocsArgsSchema>;

export function registerSeleniumTools(
  server: McpServer,
  safeHandler: typeof safeToolHandler,
  annotations: ToolAnnotations = SAFE_READONLY_ANNOTATIONS
): void {
  registerFrameworkTool(
    server,
    safeHandler,
    {
      toolName: 'read_se_docs',
      title: 'Selenium 4 Documentation & W3C Idioms',
      description:
        'Returns Selenium 4 API documentation, locator strategies, W3C Actions, BiDi interception, and Grid patterns.',
      inputSchema: SeleniumDocsArgsSchema,
      reader: readSeleniumReferenceDoc,
      frameworkName: 'selenium',
    },
    annotations
  );
}
