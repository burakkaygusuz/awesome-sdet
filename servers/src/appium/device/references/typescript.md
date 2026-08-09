# Appium Device & Application Management — TypeScript API Reference (Appium 3.x+)

> Official Appium 3.6.0+ WebdriverIO TypeScript application lifecycle controls, system panos, and device state management.

---

## 1. Application Lifecycle & Device Controls

```typescript
import { remote } from 'webdriverio';

export async function manageDeviceAndApp(driver: WebdriverIO.Browser): Promise<void> {
  const appId = 'com.example.app';

  // 1. App Lifecycle Control
  const isInstalled = await driver.isAppInstalled(appId);
  if (!isInstalled) {
    await driver.installApp('/path/to/app.apk');
  }

  // Activate / Foreground application
  await driver.activateApp(appId);

  // Background app for 5 seconds and automatically resume
  await driver.background(5);

  // Query App State (0: not installed, 1: not running, 2: background, 4: foreground)
  const appState = await driver.queryAppState(appId);
  console.log('App state code:', appState);

  // 2. Clipboard Operations
  await driver.setClipboard('sdet-auth-token-12345', 'plaintext');
  const clipContent = await driver.getClipboard();
  console.log('Clipboard content:', clipContent);

  // 3. Screen Orientation & Keyboard
  const orientation = await driver.getOrientation();
  if (orientation === 'PORTRAIT') {
    await driver.setOrientation('LANDSCAPE');
  }

  if (await driver.isKeyboardShown()) {
    await driver.hideKeyboard();
  }

  // 4. Terminate App
  await driver.terminateApp(appId);
}
```

---

## 2. Best Practices & Invariants

- **Verify App State via `queryAppState`**: Always verify app state transitions programmatically instead of using hardcoded sleeps.
- **Hide Keyboard Prior to Taps**: Call `await driver.hideKeyboard()` before tapping elements near screen bottoms.
- **Fast Resets**: Prefer `activateApp` / `terminateApp` over slow full app reinstalls.
