# Appium Device & Application Management — Java API Reference (Appium 3.x+)

> Official Appium 3.6.0+ Java Client (`InteractsWithApps`) application lifecycle controls, clipboard, and device orientation.

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

        if (driver instanceof InteractsWithApps appDriver) {
            // 1. Install & Activate
            if (!appDriver.isAppInstalled(appId)) {
                appDriver.installApp("/path/to/app.apk");
            }

            appDriver.activateApp(appId);

            // 2. Query App State
            ApplicationState state = appDriver.queryAppState(appId);
            System.out.println("App State: " + state);

            // 3. Background App
            appDriver.runAppInBackground(Duration.ofSeconds(5));

            // 4. Terminate App
            appDriver.terminateApp(appId);
        }
    }
}
```

---

## 2. Best Practices & Invariants

- **Use Pattern Matching Instanceof**: Safely cast `driver instanceof InteractsWithApps`.
- **Duration Objects**: Use `Duration.ofSeconds()` for background duration.
