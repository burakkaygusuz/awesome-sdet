import { describe, expect, it } from 'vitest';

import type { SupportedFramework, SupportedLanguage } from '../../servers/src/registry.js';
import { verifyTestArtifact } from '../../servers/src/verification/index.js';

export interface AntiPatternBenchmarkCase {
  readonly id: string;
  readonly name: string;
  readonly framework: SupportedFramework;
  readonly language?: SupportedLanguage;
  readonly category:
    'arbitrary-sleep' | 'missing-assertions' | 'fragile-xpath' | 'shared-driver-state' | 'clean';
  readonly code: string;
  readonly expectedPassed: boolean;
  readonly expectedFailedRuleId?:
    | 'no-arbitrary-waits'
    | 'meaningful-assertions'
    | 'resilient-accessibility-locators'
    | 'thread-isolated-state';
  readonly expectedHintSubstring?: string;
}

export const ANTI_PATTERN_BENCHMARK_CASES: readonly AntiPatternBenchmarkCase[] = [
  // ==========================================
  // PLAYWRIGHT BENCHMARK CASES
  // ==========================================
  {
    id: 'pw-sleep-waitfortimeout',
    name: 'Playwright: arbitrary sleep with page.waitForTimeout',
    framework: 'playwright',
    language: 'typescript',
    category: 'arbitrary-sleep',
    code: `
      import { test, expect } from '@playwright/test';

      test('slow network login', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Email').fill('user@example.com');
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.waitForTimeout(5000);
        await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
      });
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'no-arbitrary-waits',
    expectedHintSubstring: 'Replace arbitrary sleep with framework-native dynamic condition waiter',
  },
  {
    id: 'pw-sleep-python-time-sleep',
    name: 'Playwright: Python time.sleep delay',
    framework: 'playwright',
    language: 'python',
    category: 'arbitrary-sleep',
    code: `
      import time
      from playwright.sync_api import Page, expect

      def test_checkout(page: Page):
          page.goto("/cart")
          page.get_by_role("button", name="Checkout").click()
          time.sleep(3)
          expect(page.get_by_text("Order Confirmed")).to_be_visible()
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'no-arbitrary-waits',
    expectedHintSubstring: 'Replace arbitrary sleep with framework-native dynamic condition waiter',
  },
  {
    id: 'pw-missing-assertions',
    name: 'Playwright: user flow with missing assertions',
    framework: 'playwright',
    language: 'typescript',
    category: 'missing-assertions',
    code: `
      import { test } from '@playwright/test';

      test('update profile settings', async ({ page }) => {
        await page.goto('/settings');
        await page.getByLabel('Display Name').fill('New Name');
        await page.getByRole('button', { name: 'Save Changes' }).click();
      });
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'meaningful-assertions',
    expectedHintSubstring: 'Add explicit assertions',
  },
  {
    id: 'pw-fragile-xpath-div-index',
    name: 'Playwright: brittle absolute index XPath locator',
    framework: 'playwright',
    language: 'typescript',
    category: 'fragile-xpath',
    code: `
      import { test, expect } from '@playwright/test';

      test('click table cell action', async ({ page }) => {
        await page.goto('/admin/users');
        await page.locator('//html/body/div[2]/table/tbody/tr[3]/td[4]/button').click();
        await expect(page.getByRole('dialog')).toBeVisible();
      });
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'resilient-accessibility-locators',
    expectedHintSubstring: 'Replace brittle XPath/DOM index paths with accessible locators',
  },
  {
    id: 'pw-fragile-xpath-indexed-tags',
    name: 'Playwright: brittle indexed DOM tag XPath',
    framework: 'playwright',
    language: 'typescript',
    category: 'fragile-xpath',
    code: `
      import { test, expect } from '@playwright/test';

      test('select nested tab item', async ({ page }) => {
        await page.goto('/dashboard');
        const tab = page.locator('//div[1]/ul[2]/li[4]/span[1]');
        await tab.click();
        await expect(page.getByRole('tabpanel')).toBeVisible();
      });
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'resilient-accessibility-locators',
    expectedHintSubstring: 'Replace brittle XPath/DOM index paths with accessible locators',
  },
  {
    id: 'pw-shared-static-page',
    name: 'Playwright: static shared page instance across tests',
    framework: 'playwright',
    language: 'typescript',
    category: 'shared-driver-state',
    code: `
      import { Page } from '@playwright/test';

      export class BasePage {
        public static page: Page;

        async navigate() {
          await BasePage.page.goto('/home');
          expect(BasePage.page.url()).toContain('/home');
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'thread-isolated-state',
    expectedHintSubstring: 'Use test fixture-scoped page/context ({ page })',
  },
  {
    id: 'pw-clean-spec',
    name: 'Playwright: clean accessible fixture-scoped test',
    framework: 'playwright',
    language: 'typescript',
    category: 'clean',
    code: `
      import { test, expect } from '@playwright/test';

      test('user can filter catalog products', async ({ page }) => {
        await page.goto('/catalog');
        await page.getByRole('combobox', { name: 'Category' }).selectOption('Electronics');
        await page.getByRole('button', { name: 'Apply Filters' }).click();
        await expect(page.getByRole('heading', { name: 'Electronics Results' })).toBeVisible();
      });
    `,
    expectedPassed: true,
  },

  // ==========================================
  // SELENIUM BENCHMARK CASES
  // ==========================================
  {
    id: 'se-sleep-thread-sleep',
    name: 'Selenium: Thread.sleep arbitrary delay in Java',
    framework: 'selenium',
    language: 'java',
    category: 'arbitrary-sleep',
    code: `
      public class OrderTest {
        private ThreadLocal<WebDriver> driver = new ThreadLocal<>();

        @Test
        public void testSubmitOrder() throws InterruptedException {
          driver.get().get("https://example.com/checkout");
          driver.get().findElement(By.id("place-order")).click();
          Thread.sleep(4000);
          WebElement confirmation = driver.get().findElement(By.id("order-success"));
          Assert.assertTrue(confirmation.isDisplayed());
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'no-arbitrary-waits',
    expectedHintSubstring: 'Replace arbitrary sleep with framework-native dynamic condition waiter',
  },
  {
    id: 'se-sleep-csharp-task-delay',
    name: 'Selenium: Task.Delay arbitrary delay in C#',
    framework: 'selenium',
    language: 'csharp',
    category: 'arbitrary-sleep',
    code: `
      public class LoginTests {
        [Test]
        public async Task TestLoginAsync() {
          driver.Navigate().GoToUrl("https://example.com/login");
          driver.FindElement(By.Id("submit")).Click();
          await Task.Delay(2000);
          Assert.IsTrue(driver.FindElement(By.Id("welcome")).Displayed);
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'no-arbitrary-waits',
    expectedHintSubstring: 'Replace arbitrary sleep with framework-native dynamic condition waiter',
  },
  {
    id: 'se-missing-assertions',
    name: 'Selenium: actions performed without validation assertions',
    framework: 'selenium',
    language: 'java',
    category: 'missing-assertions',
    code: `
      public class NavigationTest {
        private ThreadLocal<WebDriver> driver = new ThreadLocal<>();

        @Test
        public void testMenuNavigation() {
          driver.get().get("https://example.com");
          driver.get().findElement(By.id("menu-btn")).click();
          driver.get().findElement(By.linkText("Settings")).click();
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'meaningful-assertions',
    expectedHintSubstring: 'Add explicit assertions',
  },
  {
    id: 'se-fragile-xpath-html-body',
    name: 'Selenium: absolute /html/body XPath locator',
    framework: 'selenium',
    language: 'java',
    category: 'fragile-xpath',
    code: `
      public class AccountTest {
        private ThreadLocal<WebDriver> driver = new ThreadLocal<>();

        @Test
        public void testAccountDetails() {
          driver.get().get("https://example.com/account");
          WebElement nameField = driver.get().findElement(By.xpath("/html/body/div[1]/form/div[2]/input"));
          Assert.assertEquals("Alice", nameField.getAttribute("value"));
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'resilient-accessibility-locators',
    expectedHintSubstring: 'Replace brittle XPath/DOM index paths with semantic locators',
  },
  {
    id: 'se-fragile-xpath-deep-indexed',
    name: 'Selenium: deep indexed XPath locator in Python',
    framework: 'selenium',
    language: 'python',
    category: 'fragile-xpath',
    code: `
      import unittest
      from selenium.webdriver.common.by import By

      class SearchTest(unittest.TestCase):
          def test_search_results(self):
              self.driver.get("https://example.com/search")
              result = self.driver.find_element(By.XPATH, "//div[1]/ul[2]/li[3]/a[1]")
              result.click()
              self.assertTrue(self.driver.find_element(By.ID, "details").is_displayed())
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'resilient-accessibility-locators',
    expectedHintSubstring: 'Replace brittle XPath/DOM index paths with semantic locators',
  },
  {
    id: 'se-shared-static-webdriver',
    name: 'Selenium: public static WebDriver state sharing',
    framework: 'selenium',
    language: 'java',
    category: 'shared-driver-state',
    code: `
      public class BaseTest {
        public static WebDriver driver;

        @BeforeClass
        public static void setup() {
          driver = new ChromeDriver();
        }

        @Test
        public void testHomePage() {
          driver.get("https://example.com");
          Assert.assertEquals("Home", driver.getTitle());
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'thread-isolated-state',
    expectedHintSubstring: 'Use ThreadLocal<WebDriver> or per-test driver instantiation',
  },
  {
    id: 'se-shared-static-chromedriver',
    name: 'Selenium: static ChromeDriver instance declaration',
    framework: 'selenium',
    language: 'java',
    category: 'shared-driver-state',
    code: `
      public class SuiteTest {
        static ChromeDriver driver;

        @Test
        public void verifyDashboard() {
          driver.get("https://example.com/dashboard");
          Assert.assertTrue(driver.findElement(By.id("header")).isDisplayed());
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'thread-isolated-state',
    expectedHintSubstring: 'Use ThreadLocal<WebDriver> or per-test driver instantiation',
  },
  {
    id: 'se-shared-python-global-driver',
    name: 'Selenium: global driver mutation in Python',
    framework: 'selenium',
    language: 'python',
    category: 'shared-driver-state',
    code: `
      global driver

      def test_user_logout():
          driver.get("https://example.com/logout")
          assert "Login" in driver.title
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'thread-isolated-state',
    expectedHintSubstring: 'Use ThreadLocal<WebDriver> or per-test driver instantiation',
  },
  {
    id: 'se-clean-spec',
    name: 'Selenium: clean thread-safe explicit wait test in Java',
    framework: 'selenium',
    language: 'java',
    category: 'clean',
    code: `
      public class SearchTest {
        private ThreadLocal<WebDriver> driver = new ThreadLocal<>();

        @Test
        public void testProductSearch() {
          driver.get().get("https://example.com/search");
          driver.get().findElement(By.name("query")).sendKeys("laptop");
          driver.get().findElement(By.id("search-button")).click();
          WebElement result = driver.get().findElement(By.id("results-list"));
          Assert.assertTrue(result.isDisplayed());
        }
      }
    `,
    expectedPassed: true,
  },

  // ==========================================
  // CYPRESS BENCHMARK CASES
  // ==========================================
  {
    id: 'cy-sleep-cy-wait',
    name: 'Cypress: arbitrary cy.wait delay',
    framework: 'cypress',
    language: 'typescript',
    category: 'arbitrary-sleep',
    code: `
      describe('Payment Flow', () => {
        it('processes transaction', () => {
          cy.visit('/checkout');
          cy.get('[data-testid="pay-btn"]').click();
          cy.wait(5000);
          cy.get('[data-testid="receipt"]').should('be.visible');
        });
      });
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'no-arbitrary-waits',
    expectedHintSubstring: 'Replace arbitrary sleep with framework-native dynamic condition waiter',
  },
  {
    id: 'cy-missing-assertions',
    name: 'Cypress: commands without validation assertions',
    framework: 'cypress',
    language: 'typescript',
    category: 'missing-assertions',
    code: `
      describe('User Preferences', () => {
        it('toggles dark theme', () => {
          cy.visit('/settings');
          cy.get('#theme-toggle').click();
          cy.get('#save-preferences').click();
        });
      });
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'meaningful-assertions',
    expectedHintSubstring: 'Add explicit assertions',
  },
  {
    id: 'cy-fragile-xpath',
    name: 'Cypress: brittle cy.xpath usage',
    framework: 'cypress',
    language: 'typescript',
    category: 'fragile-xpath',
    code: `
      describe('Modal Dialog', () => {
        it('clicks confirmation button', () => {
          cy.visit('/dashboard');
          cy.xpath('//body/div[3]/section[1]/div[2]/button[1]').click();
          cy.get('.toast').should('be.visible');
        });
      });
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'resilient-accessibility-locators',
    expectedHintSubstring: 'Replace brittle XPath/DOM index paths with accessible locators',
  },
  {
    id: 'cy-clean-spec',
    name: 'Cypress: clean test with accessible data-testid and assertions',
    framework: 'cypress',
    language: 'typescript',
    category: 'clean',
    code: `
      describe('Authentication Flow', () => {
        it('authenticates user with valid credentials', () => {
          cy.visit('/login');
          cy.get('[data-testid="email-field"]').type('engineer@example.com');
          cy.get('[data-testid="password-field"]').type('SecretPass123!');
          cy.get('[data-testid="login-submit"]').click();
          cy.get('[data-testid="user-avatar"]').should('be.visible');
          cy.get('[data-testid="welcome-message"]').should('contain.text', 'Welcome back');
        });
      });
    `,
    expectedPassed: true,
  },

  // ==========================================
  // VIBIUM BENCHMARK CASES
  // ==========================================
  {
    id: 'vib-sleep-waitfortimeout',
    name: 'Vibium: arbitrary waitForTimeout sleep',
    framework: 'vibium',
    language: 'typescript',
    category: 'arbitrary-sleep',
    code: `
      import { vibium, expect } from 'vibium';

      export async function runAgentTask() {
        await vibium.navigate('/agent-task');
        await vibium.click('button[name="Start"]');
        await vibium.waitForTimeout(3000);
        await expect(vibium.findByRole('status')).toHaveText('Completed');
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'no-arbitrary-waits',
    expectedHintSubstring: 'Replace arbitrary sleep with framework-native dynamic condition waiter',
  },
  {
    id: 'vib-sleep-native-sleep',
    name: 'Vibium: arbitrary sleep() call',
    framework: 'vibium',
    language: 'typescript',
    category: 'arbitrary-sleep',
    code: `
      import { vibium, expect } from 'vibium';

      export async function executeSenseThinkAct() {
        await vibium.navigate('/explore');
        await sleep(2500);
        await expect(vibium.findByRole('main')).toBeVisible();
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'no-arbitrary-waits',
    expectedHintSubstring: 'Replace arbitrary sleep with framework-native dynamic condition waiter',
  },
  {
    id: 'vib-missing-assertions',
    name: 'Vibium: agent interaction without verification assertion',
    framework: 'vibium',
    language: 'typescript',
    category: 'missing-assertions',
    code: `
      import { vibium } from 'vibium';

      export async function testFormSubmission() {
        await vibium.navigate('/feedback');
        await vibium.fill('textarea[name="comments"]', 'Great product!');
        await vibium.click('button[type="submit"]');
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'meaningful-assertions',
    expectedHintSubstring: 'Add explicit assertions',
  },
  {
    id: 'vib-fragile-xpath',
    name: 'Vibium: brittle absolute XPath locator',
    framework: 'vibium',
    language: 'typescript',
    category: 'fragile-xpath',
    code: `
      import { vibium, expect } from 'vibium';

      export async function testWidgetInteraction() {
        await vibium.navigate('/analytics');
        const widget = await vibium.find('//html/body/div[1]/main/div[2]/section[3]/div[1]');
        await widget.click();
        await expect(vibium.findByRole('dialog')).toBeVisible();
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'resilient-accessibility-locators',
    expectedHintSubstring:
      'Replace brittle XPath/DOM index paths with accessible semantic locators',
  },
  {
    id: 'vib-clean-spec',
    name: 'Vibium: clean Sense-Think-Act loop with accessible assertions',
    framework: 'vibium',
    language: 'typescript',
    category: 'clean',
    code: `
      import { vibium, expect } from 'vibium';

      export async function testAutonomousAgentSearch() {
        await vibium.navigate('/portal');
        const searchInput = await vibium.findByRole('searchbox', { name: 'Site Search' });
        await searchInput.fill('BiDi streaming');
        const submitBtn = await vibium.findByRole('button', { name: 'Search' });
        await submitBtn.click();
        await expect(vibium.findByRole('heading', { name: 'Search Results' })).toBeVisible();
      }
    `,
    expectedPassed: true,
  },

  // ==========================================
  // APPIUM BENCHMARK CASES
  // ==========================================
  {
    id: 'appium-sleep-thread-sleep',
    name: 'Appium: Thread.sleep in Android native test',
    framework: 'appium',
    language: 'java',
    category: 'arbitrary-sleep',
    code: `
      public class MobileLoginTest {
        private ThreadLocal<AndroidDriver> driver = new ThreadLocal<>();

        @Test
        public void testFingerprintAuth() throws InterruptedException {
          driver.get().findElement(AppiumBy.accessibilityId("biometric_btn")).click();
          Thread.sleep(3000);
          WebElement successView = driver.get().findElement(AppiumBy.accessibilityId("auth_success"));
          Assert.assertTrue(successView.isDisplayed());
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'no-arbitrary-waits',
    expectedHintSubstring: 'Replace arbitrary sleep with framework-native dynamic condition waiter',
  },
  {
    id: 'appium-missing-assertions',
    name: 'Appium: tap interactions without assertion checks',
    framework: 'appium',
    language: 'java',
    category: 'missing-assertions',
    code: `
      public class SettingsFlowTest {
        private ThreadLocal<AndroidDriver> driver = new ThreadLocal<>();

        @Test
        public void testNotificationToggle() {
          driver.get().findElement(AppiumBy.accessibilityId("settings_icon")).click();
          driver.get().findElement(AppiumBy.accessibilityId("notifications_switch")).click();
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'meaningful-assertions',
    expectedHintSubstring: 'Add explicit assertions',
  },
  {
    id: 'appium-fragile-xpath',
    name: 'Appium: brittle indexed hierarchy XPath',
    framework: 'appium',
    language: 'java',
    category: 'fragile-xpath',
    code: `
      public class ProfileTest {
        private ThreadLocal<AndroidDriver> driver = new ThreadLocal<>();

        @Test
        public void testEditProfile() {
          WebElement editBtn = driver.get().findElement(By.xpath("//android.widget.FrameLayout[1]/android.widget.LinearLayout[2]/android.widget.Button[1]"));
          editBtn.click();
          Assert.assertTrue(driver.get().findElement(AppiumBy.accessibilityId("save_profile")).isDisplayed());
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'resilient-accessibility-locators',
    expectedHintSubstring: 'Replace brittle XPath/DOM index paths with accessible locators',
  },
  {
    id: 'appium-shared-static-driver',
    name: 'Appium: public static AndroidDriver sharing state',
    framework: 'appium',
    language: 'java',
    category: 'shared-driver-state',
    code: `
      public class MobileBaseTest {
        public static AndroidDriver driver;

        @Test
        public void testAppLaunch() {
          WebElement header = driver.findElement(AppiumBy.accessibilityId("app_title"));
          Assert.assertTrue(header.isDisplayed());
        }
      }
    `,
    expectedPassed: false,
    expectedFailedRuleId: 'thread-isolated-state',
    expectedHintSubstring: 'Use ThreadLocal<AppiumDriver> or per-test driver instantiation',
  },
  {
    id: 'appium-clean-spec',
    name: 'Appium: clean thread-safe mobile test with accessibility IDs',
    framework: 'appium',
    language: 'java',
    category: 'clean',
    code: `
      public class CartTest {
        private ThreadLocal<AndroidDriver> driver = new ThreadLocal<>();

        @Test
        public void testAddToCart() {
          driver.get().findElement(AppiumBy.accessibilityId("add_to_cart_btn")).click();
          WebElement badge = driver.get().findElement(AppiumBy.accessibilityId("cart_badge_count"));
          Assert.assertEquals("1", badge.getText());
        }
      }
    `,
    expectedPassed: true,
  },
];

describe('Anti-Pattern Deterministic Evaluation Benchmark Suite', () => {
  it('contains at least 20 benchmark test cases across 5 supported frameworks', () => {
    expect(ANTI_PATTERN_BENCHMARK_CASES.length).toBeGreaterThanOrEqual(20);

    const frameworksRepresented = new Set(ANTI_PATTERN_BENCHMARK_CASES.map((c) => c.framework));
    expect(frameworksRepresented).toEqual(
      new Set(['playwright', 'selenium', 'cypress', 'vibium', 'appium'])
    );
  });

  describe('100% Anti-Pattern Detection Rate & Accurate Actionable Hints', () => {
    let truePositives = 0;
    let trueNegatives = 0;
    let falsePositives = 0;
    let falseNegatives = 0;

    for (const testCase of ANTI_PATTERN_BENCHMARK_CASES) {
      it(`evaluates fixture: [${testCase.framework}] ${testCase.name}`, async () => {
        const result = await verifyTestArtifact({
          framework: testCase.framework,
          language: testCase.language,
          code: testCase.code,
        });

        if (testCase.expectedPassed) {
          if (result.passed) {
            trueNegatives++;
          } else {
            falsePositives++;
          }

          expect(result.passed).toBe(true);
          expect(result.score).toBe(100);
          expect(result.actionableHints).toEqual([]);
          expect(result.checks.every((c) => c.passed)).toBe(true);
        } else {
          if (result.passed) {
            falseNegatives++;
          } else {
            truePositives++;
          }

          expect(result.passed).toBe(false);
          expect(result.score).toBeLessThan(100);
          expect(result.actionableHints.length).toBeGreaterThanOrEqual(1);

          if (testCase.expectedFailedRuleId) {
            const failedCheck = result.checks.find((c) => c.id === testCase.expectedFailedRuleId);
            expect(failedCheck, `Rule ${testCase.expectedFailedRuleId} must fail`).toBeDefined();
            expect(failedCheck?.passed).toBe(false);

            const matchingHint = result.actionableHints.some((h) =>
              h.startsWith(`[${testCase.expectedFailedRuleId}]`)
            );
            expect(
              matchingHint,
              `Actionable hint for ${testCase.expectedFailedRuleId} must be present`
            ).toBe(true);
          }

          if (testCase.expectedHintSubstring !== undefined) {
            const expectedSubstring = testCase.expectedHintSubstring;
            const hasExpectedHint = result.actionableHints.some((h) =>
              h.includes(expectedSubstring)
            );
            expect(hasExpectedHint, `Actionable hint must contain: "${expectedSubstring}"`).toBe(
              true
            );
          }
        }
      });
    }

    it('achieves 100% detection rate (recall: 1.0, precision: 1.0, zero false negatives/positives)', () => {
      const antiPatternCases = ANTI_PATTERN_BENCHMARK_CASES.filter((c) => !c.expectedPassed);
      const cleanCases = ANTI_PATTERN_BENCHMARK_CASES.filter((c) => c.expectedPassed);

      expect(antiPatternCases.length).toBeGreaterThanOrEqual(15);
      expect(cleanCases.length).toBeGreaterThanOrEqual(5);

      const detectionRate =
        antiPatternCases.length > 0 ? truePositives / antiPatternCases.length : 1;
      const precision =
        truePositives + falsePositives > 0 ? truePositives / (truePositives + falsePositives) : 1;

      expect(truePositives).toBe(antiPatternCases.length);
      expect(trueNegatives).toBe(cleanCases.length);
      expect(falseNegatives).toBe(0);
      expect(falsePositives).toBe(0);
      expect(detectionRate).toBe(1);
      expect(precision).toBe(1);
    });
  });
});
