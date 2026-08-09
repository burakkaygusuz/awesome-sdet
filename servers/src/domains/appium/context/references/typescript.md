# Appium Hybrid Context Switching — TypeScript API Reference (Appium 3.x+)

> Official Appium 3.6.0+ WebdriverIO TypeScript hybrid application automation and WebView context switching.

---

## 1. Context Discovery & Switching Flow

```typescript
import { remote } from 'webdriverio';

export async function handleHybridContext(driver: WebdriverIO.Browser): Promise<void> {
  const contexts = await driver.getContexts();
  console.log('Available contexts:', contexts);

  const webviewContext = contexts.find(
    (ctx): ctx is string => typeof ctx === 'string' && ctx.startsWith('WEBVIEW')
  );

  if (webviewContext) {
    await driver.switchContext(webviewContext);
    console.log('Switched to WebView:', webviewContext);

    // Standard DOM locators apply inside WebView (equivalent to Selenium Web)
    const webButton = await driver.$('button#checkout-btn');
    await webButton.click();

    await driver.switchContext('NATIVE_APP');
    console.log('Returned to NATIVE_APP context');
  }
}
```

---

## 2. Best Practices & Invariants

- **Auto-Download Chromedriver**: Configure `'appium:chromedriver_autodownload': true` in capabilities for Android WebViews.
- **Always Restore `NATIVE_APP`**: Always restore `NATIVE_APP` context after completing webview interactions.
- **Enable Web Contents Debugging**: Android apps must invoke `WebView.setWebContentsDebuggingEnabled(true)` in debug builds.
- **Selenium Interoperability**: Inside `WEBVIEW`, standard W3C CSS selectors and DOM explicit waits apply (see `selenium://locators/typescript`).
