import { describe, expect, it } from 'vitest';

import {
  checkArbitraryWaits,
  checkAssertions,
  checkLocators,
  checkStateIsolation,
  VerificationCheckSchema,
  VerificationRequestSchema,
  VerificationResultSchema,
  verifyTestArtifact,
  type VerificationRequest,
} from '../../servers/src/verification/index.js';

describe('Unified Verification Engine', () => {
  describe('Module Exports', () => {
    it('exports all schemas and check functions from entrypoint', () => {
      expect(VerificationRequestSchema).toBeDefined();
      expect(VerificationResultSchema).toBeDefined();
      expect(VerificationCheckSchema).toBeDefined();
      expect(checkArbitraryWaits).toBeTypeOf('function');
      expect(checkAssertions).toBeTypeOf('function');
      expect(checkLocators).toBeTypeOf('function');
      expect(checkStateIsolation).toBeTypeOf('function');
      expect(verifyTestArtifact).toBeTypeOf('function');
    });
  });

  describe('Clean Code Evaluation Across Frameworks', () => {
    it('evaluates clean Playwright test with score 100, passed: true, and empty actionableHints', async () => {
      const request: VerificationRequest = {
        framework: 'playwright',
        language: 'typescript',
        context: 'user authentication spec',
        code: `
          import { test, expect } from '@playwright/test';

          test('user can log in successfully', async ({ page }) => {
            await page.goto('/login');
            await page.getByLabel('Email').fill('user@example.com');
            await page.getByRole('button', { name: 'Sign In' }).click();
            await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
          });
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
      expect(result.actionableHints).toEqual([]);
      expect(result.checks).toHaveLength(4);
      expect(result.checks.every((c) => c.passed)).toBe(true);
    });

    it('evaluates clean Cypress test with score 100, passed: true, and empty actionableHints', async () => {
      const request: VerificationRequest = {
        framework: 'cypress',
        language: 'typescript',
        code: `
          describe('Login Flow', () => {
            it('submits valid credentials', () => {
              cy.visit('/login');
              cy.get('[data-testid="email-input"]').type('admin@example.com');
              cy.get('[data-testid="submit-btn"]').click();
              cy.get('[data-testid="welcome-banner"]').should('be.visible');
            });
          });
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
      expect(result.actionableHints).toEqual([]);
      expect(result.checks).toHaveLength(4);
      expect(result.checks.every((c) => c.passed)).toBe(true);
    });

    it('evaluates clean Selenium test with score 100, passed: true, and empty actionableHints', async () => {
      const request: VerificationRequest = {
        framework: 'selenium',
        language: 'java',
        code: `
          public class LoginTest {
            private ThreadLocal<WebDriver> driver = new ThreadLocal<>();

            @Test
            public void testLogin() {
              driver.get().get("https://example.com/login");
              driver.get().findElement(By.id("username")).sendKeys("testuser");
              driver.get().findElement(By.id("submit")).click();
              WebElement heading = driver.get().findElement(By.id("dashboard"));
              Assert.assertEquals("Dashboard", heading.getText());
            }
          }
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
      expect(result.actionableHints).toEqual([]);
      expect(result.checks.every((c) => c.passed)).toBe(true);
    });

    it('evaluates clean Appium test with score 100, passed: true, and empty actionableHints', async () => {
      const request: VerificationRequest = {
        framework: 'appium',
        language: 'python',
        code: `
          def test_mobile_login(driver):
              element = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_button")
              element.click()
              header = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "header_title")
              assert header.is_displayed()
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
      expect(result.actionableHints).toEqual([]);
      expect(result.checks.every((c) => c.passed)).toBe(true);
    });

    it('evaluates clean Vibium test with score 100, passed: true, and empty actionableHints', async () => {
      const request: VerificationRequest = {
        framework: 'vibium',
        language: 'typescript',
        code: `
          export async function verifyFlow(session: VibiumSession) {
            await session.navigate('/home');
            const button = await session.findByRole('button', { name: 'Explore' });
            await button.click();
            await expect(session.findByText('Welcome')).toBeVisible();
          }
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
      expect(result.actionableHints).toEqual([]);
      expect(result.checks.every((c) => c.passed)).toBe(true);
    });
  });

  describe('Flawed Code Evaluation & Actionable Hints', () => {
    it('detects single rule violation (arbitrary wait) and produces actionable hint', async () => {
      const request: VerificationRequest = {
        framework: 'playwright',
        language: 'typescript',
        code: `
          test('slow test', async ({ page }) => {
            await page.goto('/login');
            await page.waitForTimeout(5000);
            await expect(page.getByRole('button')).toBeVisible();
          });
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(false);
      expect(result.score).toBe(75);
      expect(result.actionableHints).toHaveLength(1);
      expect(result.actionableHints[0]).toContain('[no-arbitrary-waits]');
      expect(result.actionableHints[0]).toContain('Replace arbitrary sleep');

      const failedCheck = result.checks.find((c) => c.id === 'no-arbitrary-waits');
      expect(failedCheck?.passed).toBe(false);
      expect(failedCheck?.evidence).toContain('waitForTimeout');
    });

    it('detects missing assertions and produces actionable hint', async () => {
      const request: VerificationRequest = {
        framework: 'cypress',
        code: `
          describe('No assertions', () => {
            it('just clicks around', () => {
              cy.visit('/dashboard');
              cy.get('[data-testid="btn"]').click();
            });
          });
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(false);
      expect(result.score).toBe(75);
      expect(result.actionableHints).toHaveLength(1);
      expect(result.actionableHints[0]).toContain('[meaningful-assertions]');
      expect(result.actionableHints[0]).toContain('Add explicit assertions');
    });

    it('detects brittle locators and produces actionable hint', async () => {
      const request: VerificationRequest = {
        framework: 'selenium',
        language: 'python',
        code: `
          def test_brittle(driver):
              elem = driver.find_element(By.XPATH, "//html/body/div[1]/table/tbody/tr[2]/td[3]")
              elem.click()
              assert elem.is_displayed()
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(false);
      expect(result.score).toBe(75);
      expect(result.actionableHints).toHaveLength(1);
      expect(result.actionableHints[0]).toContain('[resilient-accessibility-locators]');
      expect(result.actionableHints[0]).toContain('Replace brittle XPath/DOM index paths');
    });

    it('detects state isolation failure and produces actionable hint', async () => {
      const request: VerificationRequest = {
        framework: 'selenium',
        language: 'java',
        code: `
          public class SharedDriverTest {
            public static WebDriver driver;

            @Test
            public void testMethod() {
              driver.get("https://example.com");
              Assert.assertEquals("Example", driver.getTitle());
            }
          }
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(false);
      expect(result.score).toBe(75);
      expect(result.actionableHints).toHaveLength(1);
      expect(result.actionableHints[0]).toContain('[thread-isolated-state]');
      expect(result.actionableHints[0]).toContain('Use ThreadLocal<WebDriver>');
    });

    it('evaluates multiple rule violations accumulating actionable hints and lowering score', async () => {
      const request: VerificationRequest = {
        framework: 'playwright',
        code: `
          test('multiple flaws', async ({ page }) => {
            await page.goto('/login');
            await page.waitForTimeout(3000);
            await page.locator('//html/body/div/button').click();
          });
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(false);
      expect(result.score).toBe(25);
      expect(result.actionableHints).toHaveLength(3);
      expect(result.actionableHints.some((h) => h.includes('[no-arbitrary-waits]'))).toBe(true);
      expect(result.actionableHints.some((h) => h.includes('[meaningful-assertions]'))).toBe(true);
      expect(
        result.actionableHints.some((h) => h.includes('[resilient-accessibility-locators]'))
      ).toBe(true);
    });

    it('evaluates catastrophic failure when all 4 rules fail yielding score 0', async () => {
      const request: VerificationRequest = {
        framework: 'selenium',
        code: `
          public class BadTest {
            public static WebDriver driver;

            public void testEverythingWrong() {
              Thread.sleep(5000);
              driver.findElement(By.xpath("//html/body/div[1]/table/tbody/tr[2]")).click();
            }
          }
        `,
      };

      const result = await verifyTestArtifact(request);

      expect(result.passed).toBe(false);
      expect(result.score).toBe(0);
      expect(result.actionableHints).toHaveLength(4);
      expect(result.checks.every((c) => !c.passed)).toBe(true);
    });
  });

  describe('Input Validation & Robustness', () => {
    it('validates raw untrusted payload and succeeds when valid', async () => {
      const untrusted: unknown = {
        framework: 'playwright',
        code: 'await expect(page.getByRole("button")).toBeVisible();',
      };

      const result = await verifyTestArtifact(untrusted);
      expect(result.passed).toBe(true);
      expect(result.score).toBe(100);
    });

    it('rejects payload with empty code string', async () => {
      const invalid = {
        framework: 'playwright',
        code: '',
      };

      await expect(verifyTestArtifact(invalid)).rejects.toThrow();
    });

    it('rejects payload with missing code', async () => {
      const invalid = {
        framework: 'playwright',
      };

      await expect(verifyTestArtifact(invalid as unknown)).rejects.toThrow();
    });

    it('rejects payload with invalid framework', async () => {
      const invalid = {
        framework: 'unsupported-framework',
        code: 'expect(true).toBe(true);',
      };

      await expect(verifyTestArtifact(invalid as unknown)).rejects.toThrow();
    });

    it('rejects payload with unrecognized strict properties', async () => {
      const invalid = {
        framework: 'playwright',
        code: 'expect(true).toBe(true);',
        extraMaliciousProp: 'pwned',
      };

      await expect(verifyTestArtifact(invalid as unknown)).rejects.toThrow();
    });

    it('rejects non-object raw inputs', async () => {
      await expect(verifyTestArtifact(null)).rejects.toThrow();
      await expect(verifyTestArtifact('not an object' as unknown)).rejects.toThrow();
      await expect(verifyTestArtifact(12345 as unknown)).rejects.toThrow();
    });
  });
});
