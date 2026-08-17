# Selenium Locator Strategies — JavaScript API Reference (Selenium 4.x+)

> Official Selenium 4 JavaScript (Node.js `selenium-webdriver`) async locator strategies & relative locators.

---

## Code Examples

```javascript
const { By, locateWith } = require('selenium-webdriver');

class LocatorExamples {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   */
  async demonstrateLocators(driver) {
    const username = await driver.findElement(By.id('username'));
    const submitBtn = await driver.findElement(By.css("button.btn-success[type='submit']"));

    const passwordInput = await driver.findElement(locateWith(By.tagName('input')).below(username));
    const cancelButton = await driver.findElement(
      locateWith(By.tagName('button')).toLeftOf(submitBtn)
    );
  }
}

module.exports = { LocatorExamples };
```

## Shadow DOM Piercing

Selenium 4 exposes open shadow roots via `getShadowRoot()`; query inside them with standard locators:

```javascript
const shadowHost = await driver.findElement(By.css('my-card'));
const shadowRoot = await shadowHost.getShadowRoot();
const inner = await shadowRoot.findElement(By.css('p'));
const nestedRoot = await (await shadowRoot.findElement(By.css('child-widget'))).getShadowRoot();
```

## Link Text Strategies

Anchor-only strategies: `By.linkText('Sign in')` / `By.partialLinkText('Sign')`.
