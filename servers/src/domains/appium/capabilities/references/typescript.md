# Appium Driver Architecture & W3C Capabilities — TypeScript API Reference (Appium 2.x+)

> Official Appium 2.x & WebdriverIO v9+ TypeScript session setup, modular driver management, and W3C compliant capabilities.

---

## 1. Android Driver Setup (WebdriverIO W3C Options)

```typescript
import { remote } from 'webdriverio';

export async function createAndroidSession(): Promise<WebdriverIO.Browser> {
  return await remote({
    protocol: 'http',
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities: {
      platformName: 'Android',
      'appium:automationName': 'UiAutomator2',
      'appium:deviceName': 'Pixel_7_API_34',
      'appium:app': '/path/to/app.apk',
      'appium:appPackage': 'com.example.app',
      'appium:appActivity': 'com.example.app.MainActivity',
      'appium:noReset': false,
      'appium:autoGrantPermissions': true,
      'appium:newCommandTimeout': 300,
    },
  });
}
```

---

## 2. iOS Driver Setup (WebdriverIO W3C Options)

```typescript
import { remote } from 'webdriverio';

export async function createIOSSession(): Promise<WebdriverIO.Browser> {
  return await remote({
    protocol: 'http',
    hostname: '127.0.0.1',
    port: 4723,
    path: '/',
    capabilities: {
      platformName: 'iOS',
      'appium:options': {
        automationName: 'XCUITest',
        deviceName: 'iPhone 15 Pro',
        platformVersion: '17.2',
        bundleId: 'com.example.sampleapp',
        noReset: true,
        wdaLocalPort: 8100,
        newCommandTimeout: 300,
      },
    },
  });
}
```

---

## 3. Server CLI & Extension Management (Appium 2.x)

```bash
# Install Appium 2.x Server Globally
npm install -g appium

# Official Driver Management
appium driver install uiautomator2
appium driver install xcuitest
appium driver list --installed

# Official Plugin Management
appium plugin install images
appium plugin install execute-driver
appium plugin list --installed

# Start Server
appium --address 127.0.0.1 --port 4723 --use-plugins=images --allow-insecure=chromedriver_autodownload
```

---

## 4. Best Practices & Invariants

- **Mandatory `appium:` Prefix / Grouping**: Custom capabilities must use `appium:` prefix or `'appium:options'` object grouping.
- **Always Close Sessions**: Wrap driver lifecycle in `try / finally` with `await driver.deleteSession()` to prevent orphan server sessions.
- **Explicit Driver Registration**: Verify drivers with `appium driver doctor <name>` before launching test execution in CI/CD.
