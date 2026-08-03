# RemoteWebDriver & Enterprise Selenium Grid 4 — JavaScript API Reference

## Code Examples

```javascript
const { Builder, Capabilities } = require('selenium-webdriver');

// 1. RemoteWebDriver Setup with Downloads
const caps = Capabilities.chrome();
caps.set('se:downloadsEnabled', true);

const driver = await new Builder()
  .usingServer('http://localhost:4444')
  .withCapabilities(caps)
  .build();

await driver.get('https://example.com');
await driver.quit();
```

## Best Practices

- **Capability Management**: Use typed Capabilities objects for grid configuration.
- **Always Quit**: Always execute `await driver.quit()`.
