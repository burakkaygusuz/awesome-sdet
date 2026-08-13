import { McpServer, ResourceNotFoundError, ResourceTemplate } from '@modelcontextprotocol/server';
import { DEFAULT_DOCS_CACHE_TTL_MS, PUBLIC_CACHE_SCOPE } from '../version.js';
import { readSeleniumReferenceDoc } from '../domains/selenium/common.js';
import { readCypressReferenceDoc } from '../domains/cypress/common.js';
import { readVibiumReferenceDoc } from '../domains/vibium/common.js';
import { readAppiumReferenceDoc } from '../domains/appium/common.js';

const RESOURCE_CACHE_HINT = {
  ttlMs: DEFAULT_DOCS_CACHE_TTL_MS,
  cacheScope: PUBLIC_CACHE_SCOPE,
};

export function registerResources(server: McpServer): void {
  server.registerResource(
    'selenium-reference',
    new ResourceTemplate('selenium://{domain}/{language}', { list: undefined }),
    {
      title: 'Selenium Documentation Reference',
      description:
        'Dynamic reference documentation for Selenium 4 across supported languages and domains.',
      mimeType: 'text/markdown',
      cacheHint: RESOURCE_CACHE_HINT,
    },
    async (
      uri: URL,
      { domain, language }: { domain?: string | string[]; language?: string | string[] }
    ) => {
      const docDomain = String(domain || 'actions');
      const docLang = String(language || 'typescript');
      try {
        const text = await readSeleniumReferenceDoc(docDomain, docLang);
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

  server.registerResource(
    'cypress-reference',
    new ResourceTemplate('cypress://{domain}/{language}', { list: undefined }),
    {
      title: 'Cypress Documentation Reference',
      description:
        'Dynamic reference documentation for Cypress across supported domains (commands, component, fixtures, network, session, shadow, stubs, task) and languages (javascript, typescript).',
      mimeType: 'text/markdown',
      cacheHint: RESOURCE_CACHE_HINT,
    },
    async (
      uri: URL,
      { domain, language }: { domain?: string | string[]; language?: string | string[] }
    ) => {
      const docDomain = String(domain || 'commands');
      const docLang = String(language || 'typescript');
      try {
        const text = await readCypressReferenceDoc(docDomain, docLang);
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

  server.registerResource(
    'vibium-reference',
    new ResourceTemplate('vibium://{domain}/{language}', { list: undefined }),
    {
      title: 'Vibium Documentation Reference',
      description:
        'Dynamic reference documentation for Vibium across supported languages and domains.',
      mimeType: 'text/markdown',
      cacheHint: RESOURCE_CACHE_HINT,
    },
    async (
      uri: URL,
      { domain, language }: { domain?: string | string[]; language?: string | string[] }
    ) => {
      const docDomain = String(domain || 'core');
      const docLang = String(language || 'typescript');
      try {
        const text = await readVibiumReferenceDoc(docDomain, docLang);
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

  server.registerResource(
    'appium-reference',
    new ResourceTemplate('appium://{domain}/{language}', { list: undefined }),
    {
      title: 'Appium Documentation Reference',
      description:
        'Dynamic reference documentation for Appium 2.0 mobile automation across supported languages and domains.',
      mimeType: 'text/markdown',
      cacheHint: RESOURCE_CACHE_HINT,
    },
    async (
      uri: URL,
      { domain, language }: { domain?: string | string[]; language?: string | string[] }
    ) => {
      const docDomain = String(domain || 'capabilities');
      const docLang = String(language || 'typescript');
      try {
        const text = await readAppiumReferenceDoc(docDomain, docLang);
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
