# RemoteWebDriver & Enterprise Selenium Grid 4 — TypeScript API Reference (Selenium 4.x+)

## Code Examples

```typescript
import { Builder, Capabilities } from 'selenium-webdriver';

const chromeCapabilities = Capabilities.chrome();
chromeCapabilities.set('se:downloadsEnabled', true);
chromeCapabilities.set('nodename:applicationName', 'node_1');

const driver = await new Builder()
  .usingServer('http://localhost:4444')
  .withCapabilities(chromeCapabilities)
  .build();

try {
  await driver.get('https://example.com');
} finally {
  await driver.quit();
}
```

## Best Practices

- **Explicit Grid URL**: Pass full hub URL `http://grid-host:4444` to `usingServer()`.
- **Session Teardown**: Always call `await driver.quit()` in `finally` blocks.
