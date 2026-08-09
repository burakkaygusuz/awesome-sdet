# Selenium Locator Strategies — TypeScript API Reference (TypeScript 5.0+ & Selenium 4.46.0+)

> Official Selenium 4 TypeScript (`selenium-webdriver`) async locator strategies & relative locators.

---

## Code Examples

```typescript
import { By, locateWith, WebDriver, WebElement } from 'selenium-webdriver';

export class LocatorExamples {
  private readonly usernameInput = By.id('username');
  private readonly submitButton = By.css("button.btn-success[type='submit']");
  private readonly emailInput = By.name('email');
  private readonly dynamicXPath = By.xpath("//tr[td[text()='Active']]//button");

  async demonstrateLocators(driver: WebDriver): Promise<void> {
    const username = await driver.findElement(this.usernameInput);
    const submitBtn = await driver.findElement(this.submitButton);

    // Selenium 4 Relative Locators (spatial queries: below, toLeftOf)
    const passwordInput = await driver.findElement(locateWith(By.tagName('input')).below(username));
    const cancelButton = await driver.findElement(
      locateWith(By.tagName('button')).toLeftOf(submitBtn)
    );
  }
}
```
