# Appium Device & Application Management — JavaScript API Reference (Appium 2.x+)

> Official Appium 2.x WebdriverIO JavaScript application lifecycle controls and device state management.

---

## 1. Application Lifecycle & Device Controls

```javascript
async function handleDeviceControls(driver) {
  const bundleId = 'com.example.sampleapp';
  try {
    const appState = await driver.queryAppState(bundleId);
    console.log('App state code:', appState);

    await driver.activateApp(bundleId);
    await driver.background(3);

    await driver.pushFile(
      '/sdcard/test-data.json',
      Buffer.from(JSON.stringify({ user: 'test' })).toString('base64')
    );

    await driver.terminateApp(bundleId);
  } finally {
    await driver.deleteSession();
  }
}
```

---

## 2. Best Practices & Invariants

- **State Code Verification**: Validate application state code before asserting UI visibility.
- **Orientation Restoration**: Restore original device orientation during test teardown.
