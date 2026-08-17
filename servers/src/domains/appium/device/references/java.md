# Appium Device & Application Management — Java API Reference (Appium 2.x+)

> Official Appium 2.x Java Client (`io.appium:java-client` v9.x+) `InteractsWithApps` application lifecycle controls, clipboard, and device orientation.

---

## 1. Application Lifecycle & Device Controls

```java
package com.example.sdet.appium;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.InteractsWithApps;
import io.appium.java_client.appmanagement.ApplicationState;

import java.time.Duration;

public class AppiumDeviceManager {
    public static void controlAppAndDevice(AppiumDriver driver) {
        String appId = "com.example.app";
        try {
            if (driver instanceof InteractsWithApps appDriver) {
                if (!appDriver.isAppInstalled(appId)) {
                    appDriver.installApp("/path/to/app.apk");
                }

                appDriver.activateApp(appId);

                ApplicationState state = appDriver.queryAppState(appId);
                System.out.println("App State: " + state);

                appDriver.runAppInBackground(Duration.ofSeconds(5));
                appDriver.terminateApp(appId);
            }
        } finally {
            driver.quit();
        }
    }
}
```

---

## 2. Best Practices & Invariants

- **Use Pattern Matching Instanceof**: Safely cast `driver instanceof InteractsWithApps`.
- **Duration Objects**: Use `Duration.ofSeconds()` for background duration.
