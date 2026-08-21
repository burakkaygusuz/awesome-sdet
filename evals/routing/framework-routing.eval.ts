import { describe, expect, it } from 'vitest';

import {
  FRAMEWORK_IDS,
  FRAMEWORK_REGISTRY,
  routeFrameworkQuery,
  type SupportedFramework,
} from '../../servers/src/registry.js';

export interface FrameworkRoutingBenchmarkCase {
  readonly id: string;
  readonly query: string;
  readonly expectedStatus?: 'matched' | 'ambiguous' | 'unmatched';
  readonly expectedFramework: SupportedFramework | null;
  readonly expectedCandidates?: readonly SupportedFramework[];
  readonly expectedDomainKeywords?: readonly string[];
  readonly description: string;
}

export const ROUTING_BENCHMARK_CASES: readonly FrameworkRoutingBenchmarkCase[] = [
  // ==========================================
  // PLAYWRIGHT QUERIES (CONFIDENT MATCH)
  // ==========================================
  {
    id: 'pw-query-modal-accessible-button',
    query: 'Test React modal with accessible button in Playwright',
    expectedStatus: 'matched',
    expectedFramework: 'playwright',
    description: 'Playwright query with accessible button and React modal',
  },
  {
    id: 'pw-query-network-interception',
    query: 'Intercept GraphQL query with page.route in Playwright and mock response body',
    expectedStatus: 'matched',
    expectedFramework: 'playwright',
    description: 'Playwright network interception using page.route',
  },
  {
    id: 'pw-query-storage-state-auth',
    query: 'Multi-tab browserContext authentication storage state in @playwright/test',
    expectedStatus: 'matched',
    expectedFramework: 'playwright',
    description: 'Playwright authentication storage state with browserContext',
  },
  {
    id: 'pw-query-parallel-assertions',
    query: 'Parallel worker isolation and web-first assertions with expect(page.getByRole())',
    expectedStatus: 'matched',
    expectedFramework: 'playwright',
    description: 'Playwright web-first assertions with getByRole locator',
  },
  {
    id: 'pw-query-stripe-checkout',
    query: 'Generate Playwright TypeScript test for Stripe checkout flow with read_sdet_docs',
    expectedStatus: 'matched',
    expectedFramework: 'playwright',
    description: 'Playwright TypeScript test generation referencing read_sdet_docs',
  },
  {
    id: 'pw-query-collision-resilience',
    query: 'Writing Playwright test with By.id selector and expect assertions',
    expectedStatus: 'matched',
    expectedFramework: 'playwright',
    description:
      'Playwright query with secondary Selenium keyword collision resolved by primary weight',
  },
  {
    id: 'pw-query-alias-shorthand',
    query: 'Setup pw parallel execution with browserContext',
    expectedStatus: 'matched',
    expectedFramework: 'playwright',
    description: 'Playwright query using shorthand alias pw and secondary keyword',
  },

  // ==========================================
  // SELENIUM QUERIES (CONFIDENT MATCH)
  // ==========================================
  {
    id: 'se-query-grid-bidi',
    query: 'Selenium Grid 4 BiDi network interception in Java with RemoteWebDriver',
    expectedStatus: 'matched',
    expectedFramework: 'selenium',
    description: 'Selenium Grid BiDi interception with RemoteWebDriver',
  },
  {
    id: 'se-query-threadlocal-pagefactory',
    query: 'ThreadLocal<WebDriver> thread-safe test execution with PageFactory in C#',
    expectedStatus: 'matched',
    expectedFramework: 'selenium',
    description: 'Selenium thread-safe PageFactory execution',
  },
  {
    id: 'se-query-chromedriver-options',
    query: 'Configure ChromeOptions and ChromeDriver service with Selenium 4 in Python',
    expectedStatus: 'matched',
    expectedFramework: 'selenium',
    description: 'Selenium ChromeDriver configuration',
  },
  {
    id: 'se-query-webdriverwait-locators',
    query:
      'Migrate legacy Selenium tests to use By.id and explicit WebDriverWait condition polling',
    expectedStatus: 'matched',
    expectedFramework: 'selenium',
    description: 'Selenium WebDriverWait and By locators',
  },
  {
    id: 'se-query-observability-bidi',
    query: 'Selenium observability setup with OpenTelemetry and read_sdet_docs for W3C BiDi events',
    expectedStatus: 'matched',
    expectedFramework: 'selenium',
    description: 'Selenium observability and read_sdet_docs',
  },

  // ==========================================
  // CYPRESS QUERIES (CONFIDENT MATCH)
  // ==========================================
  {
    id: 'cy-query-cy-origin-sso',
    query: 'Cypress cy.origin stubbing for third-party SSO authentication',
    expectedStatus: 'matched',
    expectedFramework: 'cypress',
    description: 'Cypress multi-domain cy.origin SSO query',
  },
  {
    id: 'cy-query-component-mount',
    query: 'Component testing with cy.mount and Vite in Cypress',
    expectedStatus: 'matched',
    expectedFramework: 'cypress',
    description: 'Cypress component mount testing',
  },
  {
    id: 'cy-query-intercept-graphql',
    query: 'Stub GraphQL mutation responses with cy.intercept in Cypress TypeScript',
    expectedStatus: 'matched',
    expectedFramework: 'cypress',
    description: 'Cypress network interception with cy.intercept',
  },
  {
    id: 'cy-query-session-caching',
    query: 'Speed up login authentication across test suites using cy.session in Cypress',
    expectedStatus: 'matched',
    expectedFramework: 'cypress',
    description: 'Cypress authentication session caching',
  },
  {
    id: 'cy-query-config-setup',
    query: 'Configure baseUrl and e2e support files in cypress.config.ts with read_sdet_docs',
    expectedStatus: 'matched',
    expectedFramework: 'cypress',
    description: 'Cypress configuration referencing read_sdet_docs',
  },

  // ==========================================
  // VIBIUM QUERIES (CONFIDENT MATCH)
  // ==========================================
  {
    id: 'vibium-query-sense-think-act',
    query: 'Autonomous sense-think-act visual verification loop in Vibium TypeScript',
    expectedStatus: 'matched',
    expectedFramework: 'vibium',
    description: 'Vibium sense-think-act query',
  },
  {
    id: 'vibium-query-bidi-devtools',
    query: 'Vibium Chrome DevTools Protocol BiDi event subscriptions and network mocking',
    expectedStatus: 'matched',
    expectedFramework: 'vibium',
    description: 'Vibium BiDi DevTools query',
  },
  {
    id: 'vibium-query-ai-assertions',
    query: 'Visual snapshot diffing and AI-assisted element state inspection in Vibium Python',
    expectedStatus: 'matched',
    expectedFramework: 'vibium',
    description: 'Vibium visual state inspection',
  },
  {
    id: 'vibium-query-docs-lookup',
    query: 'Lookup Vibium semantic interaction primitives with read_sdet_docs',
    expectedStatus: 'matched',
    expectedFramework: 'vibium',
    description: 'Vibium documentation lookup with read_sdet_docs',
  },
  {
    id: 'vibium-query-findbyrole-agent',
    query: 'Vibium agentic self-healing test automation using vibium.findByRole',
    expectedStatus: 'matched',
    expectedFramework: 'vibium',
    description: 'Vibium findByRole agentic locator query',
  },

  // ==========================================
  // APPIUM QUERIES (CONFIDENT MATCH)
  // ==========================================
  {
    id: 'appium-query-uiautomator2-android',
    query: 'Automate Android login screen with AppiumBy.accessibilityId and UiAutomator2',
    expectedStatus: 'matched',
    expectedFramework: 'appium',
    description: 'Appium Android automation with UiAutomator2',
  },
  {
    id: 'appium-query-xcuitest-ios',
    query: 'iOS native app gestures using XCUITest driver and IOSDriver in Appium Java',
    expectedStatus: 'matched',
    expectedFramework: 'appium',
    description: 'Appium iOS XCUITest gesture automation',
  },
  {
    id: 'appium-query-hybrid-context',
    query: 'Switch between NATIVE_APP and WEBVIEW contexts in Appium Python',
    expectedStatus: 'matched',
    expectedFramework: 'appium',
    description: 'Appium hybrid app context switching',
  },
  {
    id: 'appium-query-parallel-threadlocal',
    query: 'ThreadLocal<AndroidDriver> parallel mobile test execution on real device farm',
    expectedStatus: 'matched',
    expectedFramework: 'appium',
    description: 'Appium ThreadLocal parallel driver execution',
  },
  {
    id: 'appium-query-docs-lookup',
    query: 'Inspect Appium mobile touch action gestures with read_sdet_docs in TypeScript',
    expectedStatus: 'matched',
    expectedFramework: 'appium',
    description: 'Appium documentation lookup with read_sdet_docs',
  },

  // ==========================================
  // AMBIGUOUS / MIXED-FRAMEWORK QUERIES
  // ==========================================
  {
    id: 'ambiguous-migration-selenium-playwright',
    query: 'Migrate our legacy tests from Selenium Java to Playwright TypeScript',
    expectedStatus: 'ambiguous',
    expectedFramework: null,
    expectedCandidates: ['playwright', 'selenium'],
    description: 'Migration query mentioning both Selenium and Playwright with equal weight',
  },
  {
    id: 'ambiguous-comparison-cypress-playwright',
    query: 'Compare Cypress cy.intercept with Playwright page.route network mocking',
    expectedStatus: 'ambiguous',
    expectedFramework: null,
    expectedCandidates: ['playwright', 'cypress'],
    description: 'Comparison query containing both Cypress and Playwright signatures',
  },
  {
    id: 'ambiguous-hybrid-appium-selenium',
    query: 'Cross-platform test runner coordinating Appium mobile and Selenium desktop browsers',
    expectedStatus: 'ambiguous',
    expectedFramework: null,
    expectedCandidates: ['selenium', 'appium'],
    description: 'Hybrid architecture mentioning both Appium and Selenium',
  },

  // ==========================================
  // GENERIC / UNDERSPECIFIED TESTING (UNMATCHED)
  // ==========================================
  {
    id: 'generic-query-disabled-button',
    query: 'How to assert button is disabled in an accessible user interface test?',
    expectedStatus: 'unmatched',
    expectedFramework: null,
    description: 'Generic UI assertion question without specific framework keywords',
  },
  {
    id: 'generic-query-flaky-test-strategy',
    query: 'What is the best architectural practice to eliminate flaky tests and race conditions?',
    expectedStatus: 'unmatched',
    expectedFramework: null,
    description: 'Broad SDET strategy question with zero framework-specific signatures',
  },
  {
    id: 'generic-query-e2e-checkout',
    query: 'Write an end-to-end integration test verifying the shopping cart checkout flow',
    expectedStatus: 'unmatched',
    expectedFramework: null,
    description: 'Generic E2E workflow description with no framework context',
  },

  // ==========================================
  // UNRELATED NON-TESTING QUERIES (NEGATIVE)
  // ==========================================
  {
    id: 'unrelated-query-rust-tree',
    query: 'How to reverse a binary search tree in Rust with iterative stack traversal',
    expectedStatus: 'unmatched',
    expectedFramework: null,
    description: 'Unrelated algorithm query with no test framework context',
  },
  {
    id: 'unrelated-query-express-jwt',
    query: 'Create an Express REST API endpoint with JWT token verification and Redis rate limiter',
    expectedStatus: 'unmatched',
    expectedFramework: null,
    description: 'Unrelated backend server query',
  },
  {
    id: 'unrelated-query-postgres-pooling',
    query: 'Configure Postgres connection pooling with Prisma ORM in Next.js',
    expectedStatus: 'unmatched',
    expectedFramework: null,
    description: 'Unrelated database query',
  },
];

describe('Framework Routing Deterministic Evaluation Benchmark Suite', () => {
  it('contains 30+ diverse developer query fixtures across all supported frameworks, ambiguous cases, and controls', () => {
    expect(ROUTING_BENCHMARK_CASES.length).toBeGreaterThanOrEqual(30);

    const frameworksFound = new Set(
      ROUTING_BENCHMARK_CASES.map((c) => c.expectedFramework).filter(
        (f): f is SupportedFramework => f !== null
      )
    );
    expect(frameworksFound).toEqual(new Set(FRAMEWORK_IDS));
  });

  describe('Framework Classification, Ambiguity Detection, and Registry Matching', () => {
    it.each(ROUTING_BENCHMARK_CASES)('routes query [$id]: "$description"', (testCase) => {
      const match = routeFrameworkQuery(testCase.query);

      if (testCase.expectedStatus === 'unmatched' || testCase.expectedFramework === null) {
        if (testCase.expectedStatus === 'ambiguous') {
          expect(match).not.toBeNull();
          expect(match?.status).toBe('ambiguous');
          expect(match?.framework).toBeNull();
          if (testCase.expectedCandidates) {
            for (const candidate of testCase.expectedCandidates) {
              expect(match?.candidates).toContain(candidate);
            }
          }
        } else {
          expect(match).toBeNull();
        }
      } else {
        expect(match).not.toBeNull();
        if (match?.status !== 'matched') return;

        expect(match.status).toBe('matched');
        expect(match.framework).toBe(testCase.expectedFramework);
        expect(match.matchedKeywords.length).toBeGreaterThanOrEqual(1);

        const registryDefinition = FRAMEWORK_REGISTRY[match.framework];
        expect(registryDefinition).toBeDefined();
        expect(registryDefinition.domains.length).toBeGreaterThan(0);
        expect(registryDefinition.languages.length).toBeGreaterThan(0);
      }
    });
  });
});
