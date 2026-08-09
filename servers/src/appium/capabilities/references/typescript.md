# Appium Driver Architecture & W3C Capabilities — TypeScript API Reference (Appium 3.x+)

> Official Appium 3.6.0+ & WebdriverIO v9.30.1+ TypeScript session setup, modular driver management, and W3C compliant capabilities.

---

## 1. Android Session Setup (UiAutomator2)

```typescript
import { remote, type RemoteOptions } from 'webdriverio';

export async function createAndroidSession(): Promise<WebdriverIO.Browser> {
  const options: RemoteOptions = {
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Pixel_7_API_34',
      'appium:app': '/path/to/app-release.apk',
      'appium:appPackage': 'com.example.app',
      'appium:appActivity': 'com.example.app.MainActivity',
      'appium:noReset': false,
      'appium:fullReset': false,
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 300,
      'appium:chromedriverAutodownload': true,
    },
  };

  return await remote(options);
}
```

---

## 2. iOS Session Setup (XCUITest with Nested `appium:options`)

```typescript
import { remote, type RemoteOptions } from 'webdriverio';

export async function createIosSession(): Promise<WebdriverIO.Browser> {
  const options: RemoteOptions = {
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities: {
      platformName: 'iOS',
      'appium:options': {
        automationName: 'XCUITest',
        platformVersion: '17.2',
        deviceName: 'iPhone 15 Pro',
        app: '/path/to/SampleApp.app',
        bundleId: 'com.example.sampleapp',
        noReset: false,
        wdaLocalPort: 8100,
        showXcodeLog: false,
        newCommandTimeout: 300,
      },
    },
  };

  return await remote(options);
}
```

---

## 3. Server CLI & Extension Management (Appium 3.6.0)

```bash
# Manage Drivers and Plugins
appium driver install uiautomator2
appium driver install xcuitest
appium driver doctor uiautomator2

# Start Server (Appium 3.6.0 with scoped insecure features & unknown args tolerance)
appium --port 4723 --allow-unknown-args --allow-insecure=uiautomator2:adb_shell
```

---

## 4. Best Practices & Invariants

- **Mandatory `appium:` Prefix / Grouping**: Custom capabilities must use `appium:` prefix or `'appium:options'` object grouping.
- **Always Close Sessions**: Wrap driver lifecycle in `try / finally` with `await driver.deleteSession()` to prevent orphan server sessions.
- **Explicit Driver Registration**: Verify drivers with `appium driver doctor <name>` before launching test execution in CI/CD.
