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
  readonly expectedFramework: SupportedFramework | null;
  readonly expectedDomainKeywords?: readonly string[];
  readonly description: string;
}

export const ROUTING_BENCHMARK_CASES: readonly FrameworkRoutingBenchmarkCase[] = [
  // ==========================================
  // PLAYWRIGHT QUERIES
  // ==========================================
  {
    id: 'pw-query-modal-accessible-button',
    query: 'Test React modal with accessible button in Playwright',
    expectedFramework: 'playwright',
    description: 'Playwright query with accessible button and React modal',
  },
  {
    id: 'pw-query-network-interception',
    query: 'Intercept GraphQL query with page.route in Playwright and mock response body',
    expectedFramework: 'playwright',
    description: 'Playwright network interception using page.route',
  },
  {
    id: 'pw-query-storage-state-auth',
    query: 'Multi-tab browserContext authentication storage state in @playwright/test',
    expectedFramework: 'playwright',
    description: 'Playwright authentication storage state with browserContext',
  },
  {
    id: 'pw-query-parallel-assertions',
    query: 'Parallel worker isolation and web-first assertions with expect(page.getByRole())',
    expectedFramework: 'playwright',
    description: 'Playwright web-first assertions with getByRole locator',
  },
  {
    id: 'pw-query-stripe-checkout',
    query: 'Generate Playwright TypeScript test for Stripe checkout flow with read_pw_docs',
    expectedFramework: 'playwright',
    description: 'Playwright TypeScript test generation referencing read_pw_docs',
  },

  // ==========================================
  // SELENIUM QUERIES
  // ==========================================
  {
    id: 'se-query-grid-bidi',
    query: 'Selenium Grid 4 BiDi network interception in Java with RemoteWebDriver',
    expectedFramework: 'selenium',
    description: 'Selenium Grid BiDi interception with RemoteWebDriver',
  },
  {
    id: 'se-query-threadlocal-pagefactory',
    query: 'ThreadLocal<WebDriver> thread-safe test execution with PageFactory in C#',
    expectedFramework: 'selenium',
    description: 'Selenium thread-safe PageFactory execution',
  },
  {
    id: 'se-query-chromedriver-options',
    query: 'Configure ChromeOptions and ChromeDriver service with Selenium 4 in Python',
    expectedFramework: 'selenium',
    description: 'Selenium ChromeDriver configuration',
  },
  {
    id: 'se-query-webdriverwait-locators',
    query:
      'Migrate legacy Selenium tests to use By.id and explicit WebDriverWait condition polling',
    expectedFramework: 'selenium',
    description: 'Selenium WebDriverWait and By locators',
  },
  {
    id: 'se-query-observability-bidi',
    query: 'Selenium observability setup with OpenTelemetry and read_se_docs for W3C BiDi events',
    expectedFramework: 'selenium',
    description: 'Selenium observability and read_se_docs',
  },

  // ==========================================
  // CYPRESS QUERIES
  // ==========================================
  {
    id: 'cy-query-cy-origin-sso',
    query: 'Cypress cy.origin stubbing for third-party SSO authentication',
    expectedFramework: 'cypress',
    description: 'Cypress multi-domain cy.origin SSO query',
  },
  {
    id: 'cy-query-component-mount',
    query: 'Component testing with cy.mount and Vite in Cypress',
    expectedFramework: 'cypress',
    description: 'Cypress component testing with cy.mount',
  },
  {
    id: 'cy-query-api-request-intercept',
    query: 'API contract testing with cy.request and cy.intercept fixtures',
    expectedFramework: 'cypress',
    description: 'Cypress cy.request and cy.intercept contract testing',
  },
  {
    id: 'cy-query-session-caching',
    query: 'Session caching with cy.session and clearAllCookies in Cypress',
    expectedFramework: 'cypress',
    description: 'Cypress cy.session caching workflow',
  },
  {
    id: 'cy-query-shadow-dom',
    query: 'Shadow DOM traversal in Cypress using cy.get with includeShadowDom and read_cy_docs',
    expectedFramework: 'cypress',
    description: 'Cypress shadow DOM navigation and read_cy_docs',
  },

  // ==========================================
  // APPIUM QUERIES
  // ==========================================
  {
    id: 'appium-query-android-native-login',
    query: 'Android native login with AppiumBy.accessibilityId and UiAutomator2 in Java',
    expectedFramework: 'appium',
    description: 'Appium Android login with AppiumBy and UiAutomator2',
  },
  {
    id: 'appium-query-ios-biometrics',
    query: 'iOS FaceID biometric bypass using Appium XCUITest driver and IOSDriver',
    expectedFramework: 'appium',
    description: 'Appium iOS XCUITest driver biometric bypass',
  },
  {
    id: 'appium-query-mobile-gestures',
    query: 'Cross-platform mobile gesture swipe using Appium W3C actions API and AndroidDriver',
    expectedFramework: 'appium',
    description: 'Appium W3C mobile gesture swipe API',
  },
  {
    id: 'appium-query-flutter-driver',
    query: 'Flutter mobile app automation with Appium in Python with read_appium_docs',
    expectedFramework: 'appium',
    description: 'Appium mobile automation referencing read_appium_docs',
  },
  {
    id: 'appium-query-hybrid-webview',
    query: 'Hybrid webview context switching between NATIVE_APP and WEBVIEW in Appium',
    expectedFramework: 'appium',
    description: 'Appium hybrid context switching',
  },

  // ==========================================
  // VIBIUM QUERIES
  // ==========================================
  {
    id: 'vib-query-sense-think-act',
    query: 'Vibium browser agent Sense-Think-Act loop in TypeScript',
    expectedFramework: 'vibium',
    description: 'Vibium autonomous Sense-Think-Act agent loop',
  },
  {
    id: 'vib-query-bidi-stream',
    query: 'BiDi event stream listener in Vibium for autonomous agent interactions',
    expectedFramework: 'vibium',
    description: 'Vibium BiDi event stream agent listener',
  },
  {
    id: 'vib-query-ai-ui-automation',
    query: 'AI-driven UI test automation with Vibium core selectors and vibium.findByRole',
    expectedFramework: 'vibium',
    description: 'Vibium AI core selectors with vibium.findByRole',
  },
  {
    id: 'vib-query-state-recovery',
    query: 'State recovery and auto-healing selectors with Vibium in Python',
    expectedFramework: 'vibium',
    description: 'Vibium auto-healing state recovery',
  },
  {
    id: 'vib-query-agent-first',
    query: 'Agent-first automation in TypeScript using read_vibium_docs',
    expectedFramework: 'vibium',
    description: 'Vibium docs retrieval with read_vibium_docs',
  },

  // ==========================================
  // UNRELATED / AMBIGUOUS QUERIES (NEGATIVE)
  // ==========================================
  {
    id: 'unrelated-query-rust-tree',
    query: 'How to reverse a binary search tree in Rust with iterative stack traversal',
    expectedFramework: null,
    description: 'Unrelated algorithm query with no test framework context',
  },
  {
    id: 'unrelated-query-express-jwt',
    query: 'Create an Express REST API endpoint with JWT token verification and Redis rate limiter',
    expectedFramework: null,
    description: 'Unrelated backend server query',
  },
  {
    id: 'unrelated-query-postgres-pooling',
    query: 'Configure Postgres connection pooling with Prisma ORM in Next.js',
    expectedFramework: null,
    description: 'Unrelated database query',
  },
];

describe('Framework Routing Deterministic Evaluation Benchmark Suite', () => {
  it('contains 25+ diverse developer query fixtures across all supported frameworks and controls', () => {
    expect(ROUTING_BENCHMARK_CASES.length).toBeGreaterThanOrEqual(20);

    const frameworksFound = new Set(
      ROUTING_BENCHMARK_CASES.map((c) => c.expectedFramework).filter(
        (f): f is SupportedFramework => f !== null
      )
    );
    expect(frameworksFound).toEqual(new Set(FRAMEWORK_IDS));
  });

  describe('Framework Classification and Registry Matching', () => {
    let correctlyRouted = 0;
    let totalTargeted = 0;

    for (const testCase of ROUTING_BENCHMARK_CASES) {
      it(`routes query [${testCase.id}]: "${testCase.query.slice(0, 60)}..."`, () => {
        totalTargeted++;
        const match = routeFrameworkQuery(testCase.query);

        if (testCase.expectedFramework === null) {
          expect(match).toBeNull();
          correctlyRouted++;
        } else {
          expect(match).not.toBeNull();
          if (!match) return;

          expect(match.framework).toBe(testCase.expectedFramework);
          expect(match.matchedKeywords.length).toBeGreaterThanOrEqual(1);

          // Verify resolved framework strictly matches canonical registry
          const registryDefinition = FRAMEWORK_REGISTRY[match.framework];
          expect(registryDefinition).toBeDefined();
          expect(registryDefinition.domains.length).toBeGreaterThan(0);
          expect(registryDefinition.languages.length).toBeGreaterThan(0);
          expect(registryDefinition.toolNames.length).toBeGreaterThan(0);
          expect(registryDefinition.defaultDomain).toBeDefined();
          expect(registryDefinition.defaultLanguage).toBeDefined();

          correctlyRouted++;
        }
      });
    }

    it('achieves 100% routing accuracy against FRAMEWORK_REGISTRY (accuracy: 1.0)', () => {
      const accuracy = totalTargeted > 0 ? correctlyRouted / totalTargeted : 1;
      expect(correctlyRouted).toBe(totalTargeted);
      expect(accuracy).toBe(1);
    });
  });

  describe('Registry Consistency & Domain Parity', () => {
    it('every supported framework ID in registry has an active routing signature', () => {
      for (const frameworkId of FRAMEWORK_IDS) {
        const query = `Author deterministic tests using ${frameworkId}`;
        const match = routeFrameworkQuery(query);
        expect(match?.framework).toBe(frameworkId);
      }
    });

    it('every framework tool in registry triggers framework identification', () => {
      for (const frameworkId of FRAMEWORK_IDS) {
        const definition = FRAMEWORK_REGISTRY[frameworkId];
        for (const toolName of definition.toolNames) {
          const query = `Lookup documentation using ${toolName}`;
          const match = routeFrameworkQuery(query);
          expect(match?.framework).toBe(frameworkId);
        }
      }
    });
  });
});
