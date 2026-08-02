# Selenium Locator Strategies — JavaScript API Reference (Node.js 20+ & Selenium 4.46.0+)

> Official Selenium 4 JavaScript (Node.js `selenium-webdriver`) async locator strategies & relative locators.

---

## JavaScript Code Examples (Selenium 4)

```javascript
const { By, locateWith } = require('selenium-webdriver');

class LocatorExamples {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   */
  async demonstrateLocators(driver) {
    // 1. Standard Locators
    const username = await driver.findElement(By.id('username'));
    const submitBtn = await driver.findElement(By.css("button.btn-success[type='submit']"));

    // 2. Selenium 4 Relative Locators (Spatial)
    const passwordInput = await driver.findElement(locateWith(By.tagName('input')).below(username));
    const cancelButton = await driver.findElement(
      locateWith(By.tagName('button')).toLeftOf(submitBtn)
    );
  }
}

module.exports = { LocatorExamples };
```
