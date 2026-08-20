import { McpServer, ResourceNotFoundError } from '@modelcontextprotocol/server';
import { DEFAULT_DOCS_CACHE_TTL_MS, PUBLIC_CACHE_SCOPE } from '../version.js';

const RESOURCE_CACHE_HINT = {
  ttlMs: DEFAULT_DOCS_CACHE_TTL_MS,
  cacheScope: PUBLIC_CACHE_SCOPE,
};

export const UNIVERSAL_SDET_RESOURCES = {
  guidelines: {
    name: 'sdet-guidelines',
    uri: 'sdet://guidelines',
    title: 'Universal SDET Quality Guidelines',
    description: 'Universal SDET testing standards, assertions, and execution invariants.',
    content: `# Universal SDET Guidelines & Invariants

1. **Target Identification:** Prefer user-facing, semantic, or resilient data attributes (\`data-testid\`, \`data-cy\`, role+accessible name). Avoid brittle structural CSS paths.
2. **Synchronization & Dynamic Waiting:** NEVER use hardcoded arbitrary sleeps (\`Thread.sleep\`, \`time.sleep\`, \`cy.wait(ms)\`). Always wait on explicit conditions or state transitions.
3. **Execution Context & Isolation:** Maintain strict isolation between parallel test threads. Avoid mutating shared static state.
4. **Idempotency & Cleanup:** Clean up test data and sessions using API teardowns rather than brittle UI cleanups.`,
  },
  invariants: {
    name: 'sdet-invariants',
    uri: 'sdet://invariants',
    title: 'Universal SDET Invariants & Negative Constraints',
    description:
      'Negative constraints, forbidden anti-patterns, and deterministic execution rules.',
    content: `# Universal SDET Invariants & Prohibited Anti-Patterns

1. ❌ **Zero Arbitrary Sleeps:** Never generate hardcoded sleep/pause timeouts (\`Thread.sleep\`, \`cy.wait(ms)\`, \`page.waitForTimeout()\`). Always enforce condition-based polling or event listening.
2. ❌ **Zero Shared Mutable State:** Never share browser contexts, singletons, or global test state across parallel execution threads.
3. ❌ **Zero Brittle DOM Selectors:** Never anchor tests to full-tree XPath chains or fragile styling classes that break on redesigns.
4. ❌ **Zero Repetitive UI Logins:** Cache sessions, cookies, and tokens via storage snapshots and fast API seeding.`,
  },
  migrationMatrix: {
    name: 'sdet-migration-matrix',
    uri: 'sdet://migration-matrix',
    title: 'Universal Cross-Framework Migration Architecture Matrix',
    description:
      'Universal semantic mapping matrix for migrating test suites across Playwright, Selenium, Cypress, Vibium, and Appium.',
    content: `# Universal Cross-Framework Migration Matrix

| Universal Testing Primitive | Playwright | Selenium 4 | Cypress | Vibium | Appium |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Target Identification** | \`page.getByRole()\` | \`By.cssSelector()\` | \`cy.get('[data-testid]')\` | \`vibe.find({ role })\` | \`AppiumBy.accessibilityId()\` |
| **Action Execution** | Auto-waiting actions | WebDriver wire actions | Chained command queue | BiDi Sense-Think-Act loop | W3C Pointer actions |
| **Dynamic Wait** | Web-first assertions | Explicit \`WebDriverWait\` | Auto-retrying assertions | Event-driven BiDi stream | Explicit condition polling |
| **Network Control** | \`page.route()\` | BiDi Network intercept | \`cy.intercept()\` | BiDi Route interception | Proxy / Mock server |
| **Session & State** | \`storageState\` JSON | Injected cookies / tokens | \`cy.session()\` | BiDi state snapshots | App reset / capability seeding |
| **Execution Model** | Async / Await | Synchronous driver | Chained command subjects | Async BiDi stream | W3C remote client |`,
  },
} as const;

export function registerResources(server: McpServer): void {
  for (const resource of Object.values(UNIVERSAL_SDET_RESOURCES)) {
    server.registerResource(
      resource.name,
      resource.uri,
      {
        title: resource.title,
        description: resource.description,
        mimeType: 'text/markdown',
        cacheHint: RESOURCE_CACHE_HINT,
      },
      async (uri: URL) => {
        if (uri.href !== resource.uri) {
          throw new ResourceNotFoundError(uri.href);
        }
        return {
          contents: [
            {
              uri: uri.href,
              text: resource.content,
              mimeType: 'text/markdown',
            },
          ],
        };
      }
    );
  }
}
