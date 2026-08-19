# WebDriver BiDi Protocol — JavaScript API Reference (Selenium 4.x+)

> Official Selenium 4 JavaScript WebDriver BiDi (`selenium-webdriver/bidi`).

---

## Enabling BiDi

```javascript
const { Builder } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');

const driver = await new Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(new firefox.Options().enableBidi())
  .build();
```

---

## Code Examples

```javascript
const { Builder, By } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const { Network } = require('selenium-webdriver/bidi/network');
const { AddInterceptParameters } = require('selenium-webdriver/bidi/addInterceptParameters');
const { InterceptPhase } = require('selenium-webdriver/bidi/interceptPhase');
const LogInspector = require('selenium-webdriver/bidi/logInspector');

async function demonstrateBidi() {
  const driver = await new Builder()
    .forBrowser('firefox')
    .setFirefoxOptions(new firefox.Options().enableBidi())
    .build();

  try {
    const network = await Network(driver);
    const intercept = await network.addIntercept(
      new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT)
    );

    await network.beforeRequestSent(async (event) => {
      console.log('Request sent:', event.request.url);
    });

    const inspector = await LogInspector(driver);
    await inspector.onConsoleEntry((log) => {
      console.log('Console:', log.text);
    });

    await driver.get('https://www.selenium.dev/selenium/web/bidi/logEntryAdded.html');
    await driver.findElement(By.id('consoleLog')).click();

    await network.removeIntercept(intercept);
    await network.close();
  } finally {
    await driver.quit();
  }
}

module.exports = { demonstrateBidi };
```

## Best Practices

- **Enable BiDi in options**: Call `options.enableBidi()` on browser options before session creation.
- **Use BiDi modules over CDP**: Import `selenium-webdriver/bidi/network` and `selenium-webdriver/bidi/logInspector` instead of browser-specific CDP endpoints.
- **Close BiDi modules**: Call `network.close()` and `driver.quit()` in teardown to release WebSocket resources.
