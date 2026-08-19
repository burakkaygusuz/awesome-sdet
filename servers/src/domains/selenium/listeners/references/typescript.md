# Selenium Event Listeners — TypeScript API Reference (Selenium 4.x+)

> Driver Proxy & Command Decorator patterns in Selenium 4 TypeScript (`selenium-webdriver`).

---

## Code Examples

```typescript
import { Builder, WebDriver } from 'selenium-webdriver';

/**
 * Creates a typed command-logging Proxy wrapper around a WebDriver instance.
 */
export function createLoggingDriver(driver: WebDriver): WebDriver {
  return new Proxy(driver, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return function (...args: any[]) {
          console.log(`[WebDriver Command] ${String(prop)} called with args:`, args);
          return value.apply(target, args);
        };
      }
      return value;
    },
  });
}

export async function demonstrateListener(driver: WebDriver): Promise<void> {
  const loggingDriver = createLoggingDriver(driver);
  try {
    await loggingDriver.get('https://example.com');
  } finally {
    await driver.quit();
  }
}
```

## Best Practices

- **Use Proxy Wrapper**: TypeScript `WebDriver` does not inherit from EventEmitter; use ES6 `Proxy` to intercept and log driver method dispatches.
- **BiDi for Browser Logs**: For browser console logs and exceptions, use WebDriver BiDi (`LogInspector`) instead of command decorators.
- **Non-blocking Operations**: Keep interceptor wrappers lightweight to avoid adding latency to command dispatch.
- **Ensure Resource Cleanup**: Always wrap decorated session execution in `try...finally` to ensure `driver.quit()` is invoked.
