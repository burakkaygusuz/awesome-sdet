# Selenium Event Listeners — JavaScript API Reference (Selenium 4.x+)

> Driver Proxy & Command Decorator patterns in Selenium 4 JavaScript (`selenium-webdriver`).

---

## Code Examples

```javascript
const { Builder } = require('selenium-webdriver');

/**
 * Creates a command-logging Proxy wrapper around a WebDriver instance.
 * @param {import('selenium-webdriver').WebDriver} driver
 * @returns {import('selenium-webdriver').WebDriver}
 */
function createLoggingDriver(driver) {
  return new Proxy(driver, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === 'function') {
        return function (...args) {
          console.log(`[WebDriver Command] ${String(prop)} called with args:`, args);
          return value.apply(target, args);
        };
      }
      return value;
    },
  });
}

async function demonstrateListener(driver) {
  const loggingDriver = createLoggingDriver(driver);
  try {
    await loggingDriver.get('https://example.com');
  } finally {
    await driver.quit();
  }
}

module.exports = { createLoggingDriver, demonstrateListener };
```

## Best Practices

- **Use Proxy Wrapper**: JavaScript `WebDriver` does not inherit from EventEmitter; use ES6 `Proxy` to intercept and log driver method dispatches.
- **BiDi for Browser Logs**: For browser console logs and exceptions, use WebDriver BiDi (`LogInspector`) instead of command decorators.
- **Non-blocking Operations**: Keep interceptor wrappers lightweight to avoid adding latency to command dispatch.
- **Ensure Resource Cleanup**: Always wrap decorated session execution in `try...finally` to ensure `driver.quit()` is invoked.
