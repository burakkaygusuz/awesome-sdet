# Appium Hybrid Context Switching — JavaScript API Reference (Appium 3.6.0+)

> Official Appium 3.6.0+ WebdriverIO JavaScript hybrid application automation and WebView context switching.

---

## 1. Context Discovery & Switching Flow

```javascript
async function switchBetweenContexts(driver) {
  await driver.waitUntil(
    async () => {
      const ctxs = await driver.getContexts();
      return ctxs.some((c) => typeof c === 'string' && c.includes('WEBVIEW'));
    },
    { timeout: 10000, timeoutMsg: 'WebView context did not load in time' }
  );

  const contexts = await driver.getContexts();
  const targetWebview = contexts.find((c) => typeof c === 'string' && c.startsWith('WEBVIEW'));

  await driver.switchContext(targetWebview);
  const input = await driver.$('input[name="search"]');
  await input.setValue('Hybrid Automation');

  await driver.switchContext('NATIVE_APP');
}
```

---

## 2. Best Practices & Invariants

- **Condition Waiting for Contexts**: Always poll until the target `WEBVIEW` handle is initialized.
- **Never Leave Trapped**: Ensure `switchContext('NATIVE_APP')` is executed before interacting with native elements.
- **Selenium Interoperability**: Standard web DOM locators and assertions apply within WebViews (see `selenium://locators/javascript`).
