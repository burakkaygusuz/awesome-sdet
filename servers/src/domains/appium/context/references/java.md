# Appium Hybrid Context Switching — Java API Reference (Appium 2.x+)

> Official Appium 2.x Java Client (`io.appium:java-client` v9.x+) `SupportsContextSwitching` hybrid context navigation and WebView DOM automation.

---

## 1. Context Switching Implementation

```java
package com.example.sdet.appium;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.remote.SupportsContextSwitching;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;

import java.time.Duration;
import java.util.Set;

public class AppiumContextManager {
    public static void handleHybridFlow(AppiumDriver driver) {
        if (driver instanceof SupportsContextSwitching contextDriver) {
            Set<String> contextNames = contextDriver.getContextHandles();
            System.out.println("Available contexts: " + contextNames);

            for (String contextName : contextNames) {
                if (contextName.contains("WEBVIEW")) {
                    contextDriver.context(contextName);
                    try {
                        System.out.println("Active context: " + contextDriver.getContext());
                        WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
                        WebElement submitBtn = wait.until(ExpectedConditions.elementToBeClickable(By.cssSelector("#submit-order")));
                        submitBtn.click();
                    } finally {
                        contextDriver.context("NATIVE_APP");
                        System.out.println("Returned to native context: " + contextDriver.getContext());
                    }
                    break;
                }
            }
        }
    }
}
```

---

## 2. Best Practices & Invariants

- **Check Interface Implementation**: Use pattern matching `driver instanceof SupportsContextSwitching`.
- **Dynamic Polling**: Avoid switching to WebViews before the page finishes loading.
- **Selenium Interoperability**: `AppiumDriver` extends `RemoteWebDriver`; standard `org.openqa.selenium.By` and `WebDriverWait` apply inside WebViews (see `selenium://locators/java`).
