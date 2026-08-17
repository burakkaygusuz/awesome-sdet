# Appium Driver Architecture & W3C Capabilities — Java API Reference (Appium 2.x+)

> Official Appium 2.x Java Client (`io.appium:java-client` 9.x+) options builders, W3C capabilities, and driver factories.

---

## 1. Android Driver Setup (UiAutomator2Options)

```java
package com.example.sdet.appium;

import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.options.UiAutomator2Options;
import java.net.URI;
import java.time.Duration;

public class AndroidDriverFactory {
    public static AndroidDriver createDriver() throws Exception {
        UiAutomator2Options options = new UiAutomator2Options()
            .setPlatformName("Android")
            .setAutomationName("UiAutomator2")
            .setDeviceName("Pixel_7_API_34")
            .setApp("/path/to/app.apk")
            .setAppPackage("com.example.app")
            .setAppActivity("com.example.app.MainActivity")
            .setNoReset(false)
            .setAutoGrantPermissions(true)
            .setNewCommandTimeout(Duration.ofSeconds(300));

        return new AndroidDriver(
            URI.create("http://127.0.0.1:4723").toURL(),
            options
        );
    }
}
```

---

## 2. iOS Driver Setup (XCUITestOptions)

```java
package com.example.sdet.appium;

import io.appium.java_client.ios.IOSDriver;
import io.appium.java_client.ios.options.XCUITestOptions;
import java.net.URI;
import java.time.Duration;

public class IOSDriverFactory {
    public static IOSDriver createDriver() throws Exception {
        XCUITestOptions options = new XCUITestOptions()
            .setPlatformName("iOS")
            .setAutomationName("XCUITest")
            .setPlatformVersion("17.2")
            .setDeviceName("iPhone 15 Pro")
            .setBundleId("com.example.sampleapp")
            .setNoReset(true)
            .setWdaLocalPort(8100)
            .setNewCommandTimeout(Duration.ofSeconds(300));

        return new IOSDriver(
            URI.create("http://127.0.0.1:4723").toURL(),
            options
        );
    }
}
```

---

## 3. Best Practices & Invariants

- **Fluent Builder Pattern**: Chain configuration setters on `UiAutomator2Options` and `XCUITestOptions`.
- **URI to URL Conversion**: Use `URI.create(...).toURL()` to avoid deprecated `URL(String)` constructor.
- **Thread Isolation**: Use `ThreadLocal<AndroidDriver>` / `ThreadLocal<IOSDriver>` in multi-threaded parallel suites.
