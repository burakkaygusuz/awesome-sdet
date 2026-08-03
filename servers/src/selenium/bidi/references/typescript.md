# WebDriver BiDi Protocol — TypeScript API Reference (Selenium 4.46.0+)

> Official Selenium 4 TypeScript / JavaScript WebDriver BiDi (`bidi`).

---

## Code Examples

```typescript
import { Builder, WebDriver } from 'selenium-webdriver';

export async function demonstrateBidi(driver: WebDriver): Promise<void> {
  // 1. Enable BiDi Session
  const bidi = await driver.getBidi();

  // 2. Add Network Intercept Event Listener
  await bidi.network.addEventListener('beforeRequestSent', (event: any) => {
    console.log('Request sent:', event.request.url);
  });
}
```

## Best Practices

- **Enable BiDi Capability**: BiDi options must be enabled when creating the WebDriver session.
- **Use BiDi over CDP**: BiDi is the cross-browser W3C standard replacing browser-specific CDP endpoints.
- **Clean up listeners**: Detach event listeners (`removeEventListener`) after test execution completes.
