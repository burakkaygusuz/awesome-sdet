# Page Object Model (POM) - TypeScript API Reference

> Official Selenium WebDriver TypeScript (`selenium-webdriver`) Async Page Object Patterns.

---

## TypeScript Page Object Pattern

```typescript
import { By, until, WebDriver, WebElement } from 'selenium-webdriver';

export class LoginPage {
  private readonly usernameInput = By.id('username');
  private readonly passwordInput = By.id('password');
  private readonly loginButton = By.css("button[type='submit']");

  constructor(private readonly driver: WebDriver) {}

  async enterUsername(username: string): Promise<this> {
    const el = await this.driver.wait(
      until.elementLocated(this.usernameInput),
      10000,
      'Username input element not found'
    );
    await el.clear();
    await el.sendKeys(username);
    return this;
  }

  async enterPassword(password: string): Promise<this> {
    const el = await this.driver.wait(
      until.elementLocated(this.passwordInput),
      10000,
      'Password input element not found'
    );
    await el.clear();
    await el.sendKeys(password);
    return this;
  }

  async clickLogin(): Promise<void> {
    const btn = await this.driver.wait(
      until.elementIsVisible(this.driver.findElement(this.loginButton)),
      10000
    );
    await btn.click();
  }

  async login(username: string, password: string): Promise<void> {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }
}
```

---

## Best Practices for TypeScript Selenium POM

1. **Async/Await**: All DOM interactions return `Promise<T>`. Always await locator calls.
2. **Private Locators**: Declare locator strategies (`By.id`, `By.css`) as `private readonly` class fields.
3. **Type Annotations**: Explicitly type constructor arguments (`WebDriver`) and return promises.
