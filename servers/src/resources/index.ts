import { McpServer, ResourceNotFoundError, ResourceTemplate } from '@modelcontextprotocol/server';
import { DEFAULT_DOCS_CACHE_TTL_MS, PUBLIC_CACHE_SCOPE } from '../version.js';
import { readPlaywrightReferenceDoc } from '../domains/playwright/common.js';
import { readSeleniumReferenceDoc } from '../domains/selenium/common.js';
import { readCypressReferenceDoc } from '../domains/cypress/common.js';
import { readVibiumReferenceDoc } from '../domains/vibium/common.js';
import { readAppiumReferenceDoc } from '../domains/appium/common.js';
import { FRAMEWORK_REGISTRY } from '../registry.js';

const RESOURCE_CACHE_HINT = {
  ttlMs: DEFAULT_DOCS_CACHE_TTL_MS,
  cacheScope: PUBLIC_CACHE_SCOPE,
};

export function registerResources(server: McpServer): void {
  const playwright = FRAMEWORK_REGISTRY.playwright;
  const selenium = FRAMEWORK_REGISTRY.selenium;
  const cypress = FRAMEWORK_REGISTRY.cypress;
  const vibium = FRAMEWORK_REGISTRY.vibium;
  const appium = FRAMEWORK_REGISTRY.appium;

  server.registerResource(
    'playwright-reference',
    new ResourceTemplate(playwright.resourceUri, { list: undefined }),
    {
      title: 'Playwright Documentation Reference',
      description: `Dynamic reference documentation for Playwright across supported languages (${playwright.languages.join(', ')}) and domains (${playwright.domains.join(', ')}).`,
      mimeType: 'text/markdown',
      cacheHint: RESOURCE_CACHE_HINT,
    },
    async (
      uri: URL,
      { domain, language }: { domain?: string | string[]; language?: string | string[] }
    ) => {
      const docDomain = String(domain || 'locators');
      const docLang = String(language || 'typescript');
      try {
        const text = await readPlaywrightReferenceDoc(docDomain, docLang);
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
    'selenium-reference',
    new ResourceTemplate(selenium.resourceUri, { list: undefined }),
    {
      title: 'Selenium Documentation Reference',
      description: `Dynamic reference documentation for Selenium 4 across supported languages (${selenium.languages.join(', ')}) and domains (${selenium.domains.join(', ')}).`,
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
    new ResourceTemplate(cypress.resourceUri, { list: undefined }),
    {
      title: 'Cypress Documentation Reference',
      description: `Dynamic reference documentation for Cypress across supported domains (${cypress.domains.join(', ')}) and languages (${cypress.languages.join(', ')}).`,
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
    new ResourceTemplate(vibium.resourceUri, { list: undefined }),
    {
      title: 'Vibium Documentation Reference',
      description: `Dynamic reference documentation for Vibium across supported languages (${vibium.languages.join(', ')}) and domains (${vibium.domains.join(', ')}).`,
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
    new ResourceTemplate(appium.resourceUri, { list: undefined }),
    {
      title: 'Appium Documentation Reference',
      description: `Dynamic reference documentation for Appium 3.x mobile automation across supported languages (${appium.languages.join(', ')}) and domains (${appium.domains.join(', ')}).`,
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
