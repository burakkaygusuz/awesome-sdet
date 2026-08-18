# Selenium Locator Strategies — TypeScript API Reference (Selenium 4.x+)

> Official Selenium 4 TypeScript (`selenium-webdriver`) async locator strategies & relative locators.

---

## Code Examples

```typescript
import { By, locateWith, SearchContext, WebDriver, WebElement } from 'selenium-webdriver';

export class LocatorExamples {
  private readonly usernameInput = By.id('username');
  private readonly submitButton = By.css("button.btn-success[type='submit']");
  private readonly emailInput = By.name('email');
  private readonly dynamicXPath = By.xpath("//tr[td[text()='Active']]//button");

  async demonstrateLocators(driver: WebDriver): Promise<void> {
    const username = await driver.findElement(this.usernameInput);
    const submitBtn = await driver.findElement(this.submitButton);

    const passwordInput = await driver.findElement(locateWith(By.tagName('input')).below(username));
    await passwordInput.sendKeys('secret123');

    const cancelButton = await driver.findElement(
      locateWith(By.tagName('button')).toLeftOf(submitBtn)
    );
    await cancelButton.click();
  }
}
```

## Shadow DOM Piercing

Selenium 4 exposes open shadow roots via `getShadowRoot()`; query inside them with standard locators:

```typescript
const shadowHost: WebElement = await driver.findElement(By.css('my-card'));
const shadowRoot: SearchContext = await shadowHost.getShadowRoot();
const inner: WebElement = await shadowRoot.findElement(By.css('p'));
const nestedRoot: SearchContext = await (
  await shadowRoot.findElement(By.css('child-widget'))
).getShadowRoot();
```

## Link Text Strategies

Anchor-only strategies: `By.linkText('Sign in')` / `By.partialLinkText('Sign')`.
