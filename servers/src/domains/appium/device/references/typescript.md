# Appium Device & Application Management — TypeScript API Reference (Appium 2.x+)

> Official Appium 2.x WebdriverIO TypeScript application lifecycle controls, system panos, and device state management.

---

## 1. Application Lifecycle & Device Controls

```typescript
import { remote } from 'webdriverio';

export async function manageDeviceAndApp(driver: WebdriverIO.Browser): Promise<void> {
  const appId = 'com.example.app';
  try {
    const isInstalled = await driver.isAppInstalled(appId);
    if (!isInstalled) {
      await driver.installApp('/path/to/app.apk');
    }

    await driver.activateApp(appId);
    await driver.background(5);

    const appState = await driver.queryAppState(appId);
    console.log('App state code:', appState);

    await driver.setClipboard('sdet-auth-token-12345', 'plaintext');
    const clipContent = await driver.getClipboard();
    console.log('Clipboard content:', clipContent);

    const orientation = await driver.getOrientation();
    if (orientation === 'PORTRAIT') {
      await driver.setOrientation('LANDSCAPE');
    }

    if (await driver.isKeyboardShown()) {
      await driver.hideKeyboard();
    }

    await driver.terminateApp(appId);
  } finally {
    await driver.deleteSession();
  }
}
```

---

## 2. Best Practices & Invariants

- **Verify App State via `queryAppState`**: Always verify app state transitions programmatically instead of using hardcoded sleeps.
- **Hide Keyboard Prior to Taps**: Call `await driver.hideKeyboard()` before tapping elements near screen bottoms.
- **Fast Resets**: Prefer `activateApp` / `terminateApp` over slow full app reinstalls.
