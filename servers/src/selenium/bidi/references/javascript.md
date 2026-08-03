# WebDriver BiDi Protocol — JavaScript API Reference (Selenium 4.46.0+)

> Official Selenium 4 JavaScript WebDriver BiDi (`bidi`).

---

## Code Examples

```javascript
async function demonstrateBidi(driver) {
  // 1. Enable BiDi Session
  const bidi = await driver.getBidi();

  // 2. Add Network Intercept Event Listener
  await bidi.network.addEventListener('beforeRequestSent', (event) => {
    console.log('Request sent:', event.request.url);
  });
}

module.exports = { demonstrateBidi };
```

## Best Practices

- **Enable BiDi Capability**: BiDi options must be enabled when creating the WebDriver session.
- **Use BiDi over CDP**: BiDi is the cross-browser W3C standard replacing browser-specific CDP endpoints.
- **Clean up listeners**: Detach event listeners (`removeEventListener`) after test execution completes.
