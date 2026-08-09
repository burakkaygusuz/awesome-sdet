# Appium Device & Application Management — JavaScript API Reference (Appium 3.x+)

> Official Appium 3.6.0+ WebdriverIO JavaScript application lifecycle controls and device state management.

---

## 1. Application Lifecycle & Device Controls

```javascript
async function handleDeviceControls(driver) {
  const bundleId = 'com.example.sampleapp';

  // Check app state (0: not installed, 1: not running, 2: running in background, 4: running in foreground)
  const appState = await driver.queryAppState(bundleId);
  console.log('App state code:', appState);

  // Activate app
  await driver.activateApp(bundleId);

  // Background app for 3 seconds
  await driver.background(3);

  // Push file to device
  await driver.pushFile(
    '/sdcard/test-data.json',
    Buffer.from(JSON.stringify({ user: 'test' })).toString('base64')
  );

  // Terminate app
  await driver.terminateApp(bundleId);
}
```

---

## 2. Best Practices & Invariants

- **State Code Verification**: Validate application state code before asserting UI visibility.
- **Orientation Restoration**: Restore original device orientation during test teardown.
