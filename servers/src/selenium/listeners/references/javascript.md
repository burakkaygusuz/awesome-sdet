# Selenium Event Listeners — JavaScript API Reference (Selenium 4.46.0+)

> Official Selenium 4 JavaScript Command & Event Listeners (`selenium-webdriver`).

---

## Code Examples

```javascript
const { Builder } = require('selenium-webdriver');

async function demonstrateListener(driver) {
  // Listen for console log entry events asynchronously
  await driver.on('log.entryAdded', ({ text, level, timestamp }) => {
    console.log(`[${level}] ${timestamp}: ${text}`);
  });

  await driver.get('https://example.com');
}

module.exports = { demonstrateListener };
```

## Best Practices

- **Non-blocking Callbacks**: Keep event listener callbacks lightweight to prevent delaying command execution.
- **Async Event Handling**: Always await `driver.on()` listener registrations in async functions.
- **Error Handling**: Catch errors inside listener callbacks so logging bugs do not crash test execution.
