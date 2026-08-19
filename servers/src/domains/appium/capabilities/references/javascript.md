# Appium Driver Architecture & W3C Capabilities — JavaScript API Reference (Appium 2.x+)

> Official Appium 2.x WebdriverIO JavaScript session setup, driver management, and W3C compliant capabilities.

---

## 1. Android Session Setup (UiAutomator2)

```javascript
const { remote } = require('webdriverio');

async function createAndroidSession() {
  const driver = await remote({
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Android Emulator',
      'appium:app': './apps/sample-app.apk',
      'appium:appPackage': 'com.example.app',
      'appium:appActivity': '.MainActivity',
      'appium:noReset': false,
      'appium:autoGrantPermissions': true,
    },
  });

  return driver;
}
```

---

## 2. iOS Session Setup (XCUITest)

```javascript
const { remote } = require('webdriverio');

async function createIosSession() {
  const driver = await remote({
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities: {
      platformName: 'iOS',
      'appium:automationName': 'XCUITest',
      'appium:platformVersion': '17.2',
      'appium:deviceName': 'iPhone 15 Pro',
      'appium:bundleId': 'com.example.sampleapp',
      'appium:noReset': true,
      'appium:wdaLocalPort': 8100,
    },
  });

  return driver;
}
```

---

## 3. Best Practices & Invariants

- **Asynchronous Execution**: Always await all WebdriverIO async commands.
- **Graceful Teardown**: Always call `await driver.deleteSession()` inside `finally` blocks.
- **Scoped Insecure Flags**: Use `appium --allow-insecure=xcuitest:get_server_logs` in Appium 3.6.0+.
