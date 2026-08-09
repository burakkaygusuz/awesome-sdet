# Selenium Event Listeners — TypeScript API Reference (Selenium 4.46.0+)

> Official Selenium 4 TypeScript Command & Event Listeners (`selenium-webdriver`).

---

## Code Examples

```typescript
import { Builder, WebDriver } from 'selenium-webdriver';

export async function demonstrateListener(driver: WebDriver): Promise<void> {
  await driver.on('log.entryAdded', ({ text, level, timestamp }: any) => {
    console.log(`[${level}] ${timestamp}: ${text}`);
  });

  await driver.get('https://example.com');
}
```

## Best Practices

- **Non-blocking Callbacks**: Keep event listener callbacks lightweight to prevent delaying command execution.
- **Async Event Handling**: Always await `driver.on()` listener registrations in async functions.
- **Error Handling**: Catch errors inside listener callbacks so logging bugs do not crash test execution.
