# WebDriver BiDi Protocol — TypeScript API Reference (Selenium 4.x+)

> Official Selenium 4 TypeScript WebDriver BiDi (`selenium-webdriver/bidi`).

---

## Enabling BiDi

```typescript
import { Builder } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';

const driver = await new Builder()
  .forBrowser('firefox')
  .setFirefoxOptions(new firefox.Options().enableBidi())
  .build();
```

---

## Code Examples

```typescript
import { Builder, By } from 'selenium-webdriver';
import firefox from 'selenium-webdriver/firefox';
import { Network } from 'selenium-webdriver/bidi/network';
import { AddInterceptParameters } from 'selenium-webdriver/bidi/addInterceptParameters';
import { InterceptPhase } from 'selenium-webdriver/bidi/interceptPhase';
import LogInspector from 'selenium-webdriver/bidi/logInspector';

export async function demonstrateBidi(): Promise<void> {
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
```

## Best Practices

- **Enable BiDi in options**: Call `options.enableBidi()` on browser options before session creation.
- **Use BiDi modules over CDP**: Import `selenium-webdriver/bidi/network` and `selenium-webdriver/bidi/logInspector` instead of browser-specific CDP endpoints.
- **Close BiDi modules**: Call `network.close()` and `driver.quit()` in teardown to release WebSocket resources.
