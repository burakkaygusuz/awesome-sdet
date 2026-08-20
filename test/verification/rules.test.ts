import { describe, expect, it } from 'vitest';

import { checkArbitraryWaits } from '../../servers/src/verification/rules/waits.js';
import { checkAssertions } from '../../servers/src/verification/rules/assertions.js';
import { checkLocators } from '../../servers/src/verification/rules/locators.js';
import { checkStateIsolation } from '../../servers/src/verification/rules/isolation.js';

describe('Invariant Rules Engine', () => {
  describe('checkArbitraryWaits', () => {
    describe('Playwright', () => {
      it('detects page.waitForTimeout', () => {
        const code = `
          await page.goto('/login');
          await page.waitForTimeout(5000);
          await page.click('button');
        `;
        const check = checkArbitraryWaits(code, 'playwright');
        expect(check.passed).toBe(false);
        expect(check.severity).toBe('error');
        expect(check.evidence).toContain('waitForTimeout');
        expect(check.suggestion).toBeDefined();
      });

      it('detects Python time.sleep in Playwright test', () => {
        const code = `
          page.goto('/dashboard')
          time.sleep(3)
          page.get_by_role('button').click()
        `;
        const check = checkArbitraryWaits(code, 'playwright');
        expect(check.passed).toBe(false);
        expect(check.evidence).toContain('time.sleep');
      });

      it('passes when auto-waiting assertions or dynamic wait is used', () => {
        const code = `
          await page.goto('/login');
          await expect(page.getByRole('button', { name: 'Submit' })).toBeVisible();
          await page.waitForURL('**/dashboard');
        `;
        const check = checkArbitraryWaits(code, 'playwright');
        expect(check.passed).toBe(true);
        expect(check.id).toBe('no-arbitrary-waits');
      });
    });

    describe('Selenium', () => {
      it('detects Thread.sleep in Java Selenium', () => {
        const code = `
          driver.get("https://example.com");
          Thread.sleep(3000);
          driver.findElement(By.id("submit")).click();
        `;
        const check = checkArbitraryWaits(code, 'selenium');
        expect(check.passed).toBe(false);
        expect(check.evidence).toContain('Thread.sleep');
      });

      it('detects time.sleep in Python Selenium', () => {
        const code = `
          driver.get("https://example.com")
          time.sleep(5)
          elem = driver.find_element(By.ID, "submit")
        `;
        const check = checkArbitraryWaits(code, 'selenium');
        expect(check.passed).toBe(false);
        expect(check.evidence).toContain('time.sleep');
      });

      it('detects numeric sleep in Ruby/general Selenium', () => {
        const code = `
          driver.navigate.to "https://example.com"
          sleep(4)
          driver.find_element(:id, "submit").click
        `;
        const check = checkArbitraryWaits(code, 'selenium');
        expect(check.passed).toBe(false);
        expect(check.evidence).toContain('sleep');
      });

      it('passes when WebDriverWait / ExpectedConditions is used', () => {
        const code = `
          WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
          WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("submit")));
          element.click();
        `;
        const check = checkArbitraryWaits(code, 'selenium');
        expect(check.passed).toBe(true);
      });
    });

    describe('Cypress', () => {
      it('detects numeric cy.wait', () => {
        const code = `
          cy.visit('/dashboard');
          cy.wait(5000);
          cy.get('[data-testid=submit]').click();
        `;
        const check = checkArbitraryWaits(code, 'cypress');
        expect(check.passed).toBe(false);
        expect(check.evidence).toContain('cy.wait');
      });

      it('passes when cy.wait is used with network route alias', () => {
        const code = `
          cy.intercept('GET', '/api/users').as('getUsers');
          cy.visit('/users');
          cy.wait('@getUsers');
          cy.get('.user-list').should('be.visible');
        `;
        const check = checkArbitraryWaits(code, 'cypress');
        expect(check.passed).toBe(true);
      });

      it('passes when condition waiters and assertions are used', () => {
        const code = `
          cy.visit('/items');
          cy.get('.spinner').should('not.exist');
          cy.get('.item').should('have.length.greaterThan', 0);
        `;
        const check = checkArbitraryWaits(code, 'cypress');
        expect(check.passed).toBe(true);
      });
    });

    describe('Vibium', () => {
      it('detects arbitrary sleep in Vibium', () => {
        const code = `
          await vibium.launch();
          await sleep(2000);
          await vibium.click('button');
        `;
        const check = checkArbitraryWaits(code, 'vibium');
        expect(check.passed).toBe(false);
        expect(check.evidence).toContain('sleep');
      });

      it('passes when Vibium auto-waits or asserts', () => {
        const code = `
          await vibium.launch();
          await expect(vibium.find('button')).toBeVisible();
        `;
        const check = checkArbitraryWaits(code, 'vibium');
        expect(check.passed).toBe(true);
      });
    });

    describe('Appium', () => {
      it('detects Thread.sleep in Appium test', () => {
        const code = `
          driver.findElement(AppiumBy.accessibilityId("login_btn")).click();
          Thread.sleep(4000);
          driver.findElement(AppiumBy.accessibilityId("home_screen"));
        `;
        const check = checkArbitraryWaits(code, 'appium');
        expect(check.passed).toBe(false);
        expect(check.evidence).toContain('Thread.sleep');
      });

      it('passes when Appium uses WebDriverWait', () => {
        const code = `
          WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
          wait.until(ExpectedConditions.presenceOfElementLocated(AppiumBy.accessibilityId("home_screen")));
        `;
        const check = checkArbitraryWaits(code, 'appium');
        expect(check.passed).toBe(true);
      });
    });
  });

  describe('checkAssertions', () => {
    describe('Playwright', () => {
      it('detects missing assertions in Playwright test', () => {
        const code = `
          await page.goto('/dashboard');
          await page.getByRole('link', { name: 'Settings' }).click();
        `;
        const check = checkAssertions(code, 'playwright');
        expect(check.passed).toBe(false);
        expect(check.severity).toBe('error');
        expect(check.suggestion).toContain('expect(');
      });

      it('passes when expect assertion is present', () => {
        const code = `
          await page.goto('/dashboard');
          await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
        `;
        const check = checkAssertions(code, 'playwright');
        expect(check.passed).toBe(true);
        expect(check.id).toBe('meaningful-assertions');
      });
    });

    describe('Selenium', () => {
      it('detects missing assertions in Selenium test', () => {
        const code = `
          driver.get("https://example.com");
          driver.findElement(By.id("submit")).click();
        `;
        const check = checkAssertions(code, 'selenium');
        expect(check.passed).toBe(false);
      });

      it('passes with JUnit/TestNG Assert', () => {
        const code = `
          String title = driver.getTitle();
          Assert.assertEquals(title, "Dashboard");
        `;
        const check = checkAssertions(code, 'selenium');
        expect(check.passed).toBe(true);
      });

      it('passes with AssertJ assertThat', () => {
        const code = `
          String text = driver.findElement(By.tagName("h1")).getText();
          assertThat(text).isEqualTo("Welcome");
        `;
        const check = checkAssertions(code, 'selenium');
        expect(check.passed).toBe(true);
      });

      it('passes with Python unittest self.assert or pytest assert', () => {
        const code = `
          elem = driver.find_element(By.ID, "title")
          self.assertEqual(elem.text, "Dashboard")
        `;
        const check = checkAssertions(code, 'selenium');
        expect(check.passed).toBe(true);

        const pytestCode = `
          elem = driver.find_element(By.ID, "title")
          assert elem.text == "Dashboard"
        `;
        const pytestCheck = checkAssertions(pytestCode, 'selenium');
        expect(pytestCheck.passed).toBe(true);
      });
    });

    describe('Cypress', () => {
      it('detects missing assertions in Cypress test', () => {
        const code = `
          cy.visit('/login');
          cy.get('#username').type('admin');
          cy.get('#submit').click();
        `;
        const check = checkAssertions(code, 'cypress');
        expect(check.passed).toBe(false);
      });

      it('passes with cy.get().should()', () => {
        const code = `
          cy.visit('/login');
          cy.get('.welcome-banner').should('be.visible');
        `;
        const check = checkAssertions(code, 'cypress');
        expect(check.passed).toBe(true);
      });

      it('passes with expect() in Cypress', () => {
        const code = `
          cy.request('/api/health').then((res) => {
            expect(res.status).to.eq(200);
          });
        `;
        const check = checkAssertions(code, 'cypress');
        expect(check.passed).toBe(true);
      });
    });

    describe('Vibium & Appium', () => {
      it('passes Vibium with expect', () => {
        const code = `
          await vibium.launch();
          await expect(vibium.find('h1')).toHaveText('Home');
        `;
        const check = checkAssertions(code, 'vibium');
        expect(check.passed).toBe(true);
      });

      it('passes Appium with Assert.assertTrue', () => {
        const code = `
          WebElement el = driver.findElement(AppiumBy.accessibilityId("header"));
          Assert.assertTrue(el.isDisplayed());
        `;
        const check = checkAssertions(code, 'appium');
        expect(check.passed).toBe(true);
      });
    });
  });

  describe('checkLocators', () => {
    it('detects brittle full XPath locator in Playwright', () => {
      const code = `
        const el = page.locator('//html/body/div[1]/table/tr[2]/td[3]/button');
        await el.click();
      `;
      const check = checkLocators(code, 'playwright');
      expect(check.passed).toBe(false);
      expect(check.severity).toBe('error');
      expect(check.evidence).toBeDefined();
      expect(check.suggestion).toContain('getByRole');
    });

    it('detects indexed XPath hierarchy in Selenium By.xpath', () => {
      const code = `
        WebElement btn = driver.findElement(By.xpath("//div[1]/table/tbody/tr[2]/td[1]"));
        btn.click();
      `;
      const check = checkLocators(code, 'selenium');
      expect(check.passed).toBe(false);
    });

    it('detects brittle XPath in Cypress cy.xpath', () => {
      const code = `
        cy.xpath('//html/body/div[2]/span[1]').click();
      `;
      const check = checkLocators(code, 'cypress');
      expect(check.passed).toBe(false);
    });

    it('passes when semantic Playwright getByRole / getByLabel / getByTestId is used', () => {
      const code = `
        await page.getByRole('button', { name: 'Submit' }).click();
        await page.getByLabel('Username').fill('test');
        await page.getByTestId('status-pill').click();
      `;
      const check = checkLocators(code, 'playwright');
      expect(check.passed).toBe(true);
      expect(check.id).toBe('resilient-accessibility-locators');
    });

    it('passes when standard By.id / By.name / By.cssSelector is used in Selenium', () => {
      const code = `
        WebElement user = driver.findElement(By.id("username"));
        WebElement pass = driver.findElement(By.name("password"));
        WebElement submit = driver.findElement(By.cssSelector("[data-testid='submit']"));
      `;
      const check = checkLocators(code, 'selenium');
      expect(check.passed).toBe(true);
    });

    it('passes when AppiumBy.accessibilityId is used in Appium', () => {
      const code = `
        WebElement el = driver.findElement(AppiumBy.accessibilityId("login_button"));
        el.click();
      `;
      const check = checkLocators(code, 'appium');
      expect(check.passed).toBe(true);
    });
  });

  describe('checkStateIsolation', () => {
    it('detects public static WebDriver in Java Selenium', () => {
      const code = `
        public class LoginTest {
          public static WebDriver driver;

          @BeforeAll
          public static void setup() {
            driver = new ChromeDriver();
          }
        }
      `;
      const check = checkStateIsolation(code, 'selenium');
      expect(check.passed).toBe(false);
      expect(check.severity).toBe('error');
      expect(check.evidence).toContain('public static WebDriver driver');
      expect(check.suggestion).toContain('ThreadLocal');
    });

    it('detects static WebDriver without public modifier', () => {
      const code = `
        public class BaseTest {
          static WebDriver driver;
        }
      `;
      const check = checkStateIsolation(code, 'selenium');
      expect(check.passed).toBe(false);
      expect(check.evidence).toContain('static WebDriver driver');
    });

    it('detects static RemoteWebDriver or ChromeDriver', () => {
      const code = `
        public class GridTest {
          private static RemoteWebDriver driver;
        }
      `;
      const check = checkStateIsolation(code, 'selenium');
      expect(check.passed).toBe(false);
    });

    it('detects static AppiumDriver in Appium', () => {
      const code = `
        public class MobileTest {
          public static AndroidDriver driver;
        }
      `;
      const check = checkStateIsolation(code, 'appium');
      expect(check.passed).toBe(false);
    });

    it('detects global driver in Python', () => {
      const code = `
        global driver
        def test_login():
          driver.get("https://example.com")
      `;
      const check = checkStateIsolation(code, 'selenium');
      expect(check.passed).toBe(false);
      expect(check.evidence).toContain('global driver');
    });

    it('passes when ThreadLocal driver is used in Java Selenium', () => {
      const code = `
        public class BaseTest {
          private static final ThreadLocal<WebDriver> driver = new ThreadLocal<>();

          public WebDriver getDriver() {
            return driver.get();
          }
        }
      `;
      const check = checkStateIsolation(code, 'selenium');
      expect(check.passed).toBe(true);
      expect(check.id).toBe('thread-isolated-state');
    });

    it('passes when per-test fixture or instance driver is used', () => {
      const code = `
        public class LoginTest {
          private WebDriver driver;

          @BeforeEach
          public void setup() {
            this.driver = new ChromeDriver();
          }
        }
      `;
      const check = checkStateIsolation(code, 'selenium');
      expect(check.passed).toBe(true);
    });

    it('passes for Playwright test fixture lifecycle', () => {
      const code = `
        import { test, expect } from '@playwright/test';

        test('isolated test', async ({ page }) => {
          await page.goto('/login');
          await expect(page).toHaveTitle('Login');
        });
      `;
      const check = checkStateIsolation(code, 'playwright');
      expect(check.passed).toBe(true);
    });
  });
});
