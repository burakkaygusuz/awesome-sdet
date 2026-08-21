import type { McpServer } from '@modelcontextprotocol/server';
import { z } from 'zod';
import { readAppiumReferenceDoc } from '../domains/appium/common.js';
import { readCypressReferenceDoc } from '../domains/cypress/common.js';
import { readPlaywrightReferenceDoc } from '../domains/playwright/common.js';
import { readSeleniumReferenceDoc } from '../domains/selenium/common.js';
import {
  DocsOutputSchema,
  extractStructuredDocs,
  SAFE_READONLY_ANNOTATIONS,
  sanitizeDomain,
  sanitizeLanguage,
} from '../domains/shared.js';
import { readVibiumReferenceDoc } from '../domains/vibium/common.js';
import {
  FRAMEWORK_IDS,
  FRAMEWORK_REGISTRY,
  SUPPORTED_LANGUAGES,
  type SupportedFramework,
} from '../registry.js';
import { safeToolHandler } from '../server.js';

export const DocsGatewayInputSchema = z.strictObject({
  framework: z.enum(FRAMEWORK_IDS).describe('Target test automation framework'),
  domain: z
    .string()
    .min(1)
    .describe('Capability domain (e.g. locators, actions, network, storage, bidi)'),
  language: z.enum(SUPPORTED_LANGUAGES).optional().describe('Target programming language'),
  query: z
    .string()
    .optional()
    .describe('Optional search query or heading filter to prevent token bloat'),
});

export type DocsGatewayInput = z.infer<typeof DocsGatewayInputSchema>;

export const FRAMEWORK_READERS: Record<
  SupportedFramework,
  (domain: string, language?: string) => Promise<string>
> = {
  playwright: readPlaywrightReferenceDoc,
  selenium: readSeleniumReferenceDoc,
  cypress: readCypressReferenceDoc,
  vibium: readVibiumReferenceDoc,
  appium: readAppiumReferenceDoc,
};

export function registerUniversalDocsGateway(server: McpServer): void {
  server.registerTool(
    'read_sdet_docs',
    {
      title: 'Universal SDET Documentation Gateway',
      description:
        'Retrieves progressive reference documentation, API patterns, and code snippets across all test automation frameworks.',
      inputSchema: DocsGatewayInputSchema,
      outputSchema: DocsOutputSchema,
      annotations: SAFE_READONLY_ANNOTATIONS,
    },
    safeToolHandler(async (args: DocsGatewayInput) => {
      const { framework, domain, language, query } = args;
      const frameworkConfig = FRAMEWORK_REGISTRY[framework];
      if (!frameworkConfig) {
        throw new Error(`Unsupported framework: '${framework}'.`);
      }

      const targetDomain = sanitizeDomain(
        domain,
        frameworkConfig.domains as readonly string[],
        frameworkConfig.defaultDomain,
        framework
      );

      const targetLanguage = sanitizeLanguage(
        language,
        frameworkConfig.languages as readonly string[],
        frameworkConfig.defaultLanguage,
        framework
      );

      const reader = FRAMEWORK_READERS[framework];
      if (!reader) {
        throw new Error(`No documentation reader registered for framework: '${framework}'.`);
      }

      const markdown = await reader(targetDomain, targetLanguage);
      const { structuredContent, renderedMarkdown } = extractStructuredDocs(
        framework,
        targetDomain,
        targetLanguage,
        markdown,
        query
      );

      return {
        content: [{ type: 'text', text: renderedMarkdown }],
        structuredContent,
      };
    })
  );
}
