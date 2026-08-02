# Page Object Model (POM) - JavaScript API Reference

> Official Selenium WebDriver JavaScript Binding (`selenium-webdriver`) Page Object Patterns.

---

## JavaScript Page Object Pattern

```javascript
const { By, until } = require('selenium-webdriver');

class LoginPage {
  /**
   * @param {import('selenium-webdriver').WebDriver} driver
   */
  constructor(driver) {
    this.driver = driver;
    this.usernameInput = By.id('username');
    this.passwordInput = By.id('password');
    this.loginButton = By.css("button[type='submit']");
  }

  async enterUsername(username) {
    const el = await this.driver.wait(until.elementLocated(this.usernameInput), 10000);
    await el.clear();
    await el.sendKeys(username);
    return this;
  }

  async enterPassword(password) {
    const el = await this.driver.wait(until.elementLocated(this.passwordInput), 10000);
    await el.clear();
    await el.sendKeys(password);
    return this;
  }

  async clickLogin() {
    const btn = await this.driver.wait(
      until.elementIsVisible(this.driver.findElement(this.loginButton)),
      10000
    );
    await btn.click();
  }

  async login(username, password) {
    await this.enterUsername(username);
    await this.enterPassword(password);
    await this.clickLogin();
  }
}

module.exports = { LoginPage };
```

---

## Best Practices for JavaScript Selenium POM

1. **JSDoc Comments**: Annotate constructor parameter with `@param {WebDriver}` for IDE autocompletion.
2. **ES6 Classes**: Use ES6 `class` syntax exported via `module.exports` or `export default`.
3. **Promises**: Always return promises and use `async/await` for asynchronous operations.
