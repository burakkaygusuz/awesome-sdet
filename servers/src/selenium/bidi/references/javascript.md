# WebDriver BiDi Protocol — JavaScript API Reference (Selenium 4.46.0+)

> Official Selenium 4 JavaScript WebDriver BiDi (`bidi`).

---

## Code Examples

```javascript
const { Builder, chrome } = require('selenium-webdriver');

async function demonstrateBidi() {
  const options = new chrome.Options();
  options.setCapability('webSocketUrl', true);

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  const bidi = await driver.getBidi();

  await bidi.network.addEventListener('beforeRequestSent', (event) => {
    console.log('Request sent:', event.request.url);
  });
}

module.exports = { demonstrateBidi };
```

## Best Practices

- **Enable BiDi Capability**: BiDi options (`webSocketUrl: true`) must be enabled when creating the WebDriver session.
- **Use BiDi over CDP**: BiDi is the cross-browser W3C standard replacing browser-specific CDP endpoints.
- **Clean up listeners**: Detach event listeners (`removeEventListener`) after test execution completes.
