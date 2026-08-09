# WebDriver BiDi Protocol — TypeScript API Reference (Selenium 4.x+)

> Official Selenium 4 TypeScript / JavaScript WebDriver BiDi (`bidi`).

---

## Code Examples

```typescript
import { Builder, chrome } from 'selenium-webdriver';

export async function demonstrateBidi(): Promise<void> {
  const options = new chrome.Options();
  options.setCapability('webSocketUrl', true);

  const driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();

  const bidi = await driver.getBidi();

  await bidi.network.addEventListener('beforeRequestSent', (event: any) => {
    console.log('Request sent:', event.request.url);
  });
}
```

## Best Practices

- **Enable BiDi Capability**: BiDi options (`webSocketUrl: true`) must be enabled when creating the WebDriver session.
- **Use BiDi over CDP**: BiDi is the cross-browser W3C standard replacing browser-specific CDP endpoints.
- **Clean up listeners**: Detach event listeners (`removeEventListener`) after test execution completes.
