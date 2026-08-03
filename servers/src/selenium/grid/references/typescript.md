# RemoteWebDriver & Enterprise Selenium Grid 4 — TypeScript API Reference

## Code Examples

```typescript
import { Builder, Capabilities } from 'selenium-webdriver';

// 1. RemoteWebDriver with Downloads Enabled
const chromeCapabilities = Capabilities.chrome();
chromeCapabilities.set('se:downloadsEnabled', true);

const driver = await new Builder()
  .usingServer('http://localhost:4444')
  .withCapabilities(chromeCapabilities)
  .build();

// 2. Custom Node Stereotypes
chromeCapabilities.set('nodename:applicationName', 'node_1');

await driver.get('https://example.com');
await driver.quit();
```

## Best Practices

- **Explicit Grid URL**: Pass full hub URL `http://grid-host:4444` to `usingServer()`.
- **Session Teardown**: Always call `await driver.quit()` in `finally` blocks.
