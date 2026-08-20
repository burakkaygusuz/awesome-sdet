import { McpServer, ResourceNotFoundError, ResourceTemplate } from '@modelcontextprotocol/server';
import { DEFAULT_DOCS_CACHE_TTL_MS, PUBLIC_CACHE_SCOPE } from '../version.js';
import { readPlaywrightReferenceDoc } from '../domains/playwright/common.js';
import { readSeleniumReferenceDoc } from '../domains/selenium/common.js';
import { readCypressReferenceDoc } from '../domains/cypress/common.js';
import { readVibiumReferenceDoc } from '../domains/vibium/common.js';
import { readAppiumReferenceDoc } from '../domains/appium/common.js';
import { FRAMEWORK_REGISTRY, type SupportedFramework } from '../registry.js';

const RESOURCE_CACHE_HINT = {
  ttlMs: DEFAULT_DOCS_CACHE_TTL_MS,
  cacheScope: PUBLIC_CACHE_SCOPE,
};

const FRAMEWORK_RESOURCE_CONFIGS: Record<
  SupportedFramework,
  {
    readonly title: string;
    readonly reader: (domain: string, language?: string) => Promise<string>;
  }
> = {
  playwright: {
    title: 'Playwright Documentation Reference',
    reader: readPlaywrightReferenceDoc,
  },
  selenium: {
    title: 'Selenium Documentation Reference',
    reader: readSeleniumReferenceDoc,
  },
  cypress: {
    title: 'Cypress Documentation Reference',
    reader: readCypressReferenceDoc,
  },
  vibium: {
    title: 'Vibium Documentation Reference',
    reader: readVibiumReferenceDoc,
  },
  appium: {
    title: 'Appium Documentation Reference',
    reader: readAppiumReferenceDoc,
  },
};

export function registerResources(server: McpServer): void {
  for (const [key, meta] of Object.entries(FRAMEWORK_RESOURCE_CONFIGS) as Array<
    [SupportedFramework, (typeof FRAMEWORK_RESOURCE_CONFIGS)[SupportedFramework]]
  >) {
    const fw = FRAMEWORK_REGISTRY[key];

    server.registerResource(
      `${key}-reference`,
      new ResourceTemplate(fw.resourceUri, { list: undefined }),
      {
        title: meta.title,
        description: `Dynamic reference documentation for ${key} across supported languages (${fw.languages.join(', ')}) and domains (${fw.domains.join(', ')}).`,
        mimeType: 'text/markdown',
        cacheHint: RESOURCE_CACHE_HINT,
      },
      async (
        uri: URL,
        { domain, language }: { domain?: string | string[]; language?: string | string[] }
      ) => {
        const docDomain = String(domain || fw.defaultDomain);
        const docLang = String(language || fw.defaultLanguage);
        try {
          const text = await meta.reader(docDomain, docLang);
          return {
            contents: [
              {
                uri: uri.href,
                text,
                mimeType: 'text/markdown',
              },
            ],
          };
        } catch {
          throw new ResourceNotFoundError(uri.href);
        }
      }
    );
  }

  server.registerResource(
    'sdet-guidelines',
    'sdet://guidelines',
    {
      title: 'Universal SDET Quality Guidelines',
      description: 'Universal SDET testing standards, assertions, and execution invariants.',
      mimeType: 'text/markdown',
      cacheHint: RESOURCE_CACHE_HINT,
    },
    async (uri: URL) => ({
      contents: [
        {
          uri: uri.href,
          text: `# Universal SDET Guidelines & Invariants

1. **Target Identification:** Prefer user-facing, semantic, or resilient data attributes (\`data-testid\`, \`data-cy\`, role+accessible name). Avoid brittle structural CSS paths.
2. **Synchronization & Dynamic Waiting:** NEVER use hardcoded arbitrary sleeps (\`Thread.sleep\`, \`time.sleep\`, \`cy.wait(ms)\`). Always wait on explicit conditions or state transitions.
3. **Execution Context & Isolation:** Maintain strict isolation between parallel test threads. Avoid mutating shared static state.
4. **Idempotency & Cleanup:** Clean up test data and sessions using API teardowns rather than brittle UI cleanups.`,
          mimeType: 'text/markdown',
        },
      ],
    })
  );
}
