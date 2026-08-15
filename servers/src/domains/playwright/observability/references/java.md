# Playwright Observability, Tracing & Visual Testing — Java Reference

> Playwright Java supports execution tracing via `Tracing.start()` and visual regression assertions.

---

## 1. Trace Recording

```java
package com.example.playwright;

import java.nio.file.Paths;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.Tracing;

public class TracingExamples {
    public static void recordTrace(Browser browser) {
        BrowserContext context = browser.newContext();
        context.tracing().start(new Tracing.StartOptions()
            .setScreenshots(true)
            .setSnapshots(true)
            .setSources(true));

        Page page = context.newPage();
        page.navigate("https://example.com/dashboard");

        context.tracing().stop(new Tracing.StopOptions()
            .setPath(Paths.get("test-results/traces/dashboard.zip")));

        context.close();
    }
}
```

---

## 2. Screenshots & Visual Verification

```java
package com.example.playwright;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import java.nio.file.Paths;
import java.util.List;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.assertions.PageAssertions;

public class VisualExamples {
    public static void captureAndAssert(Page page) {
        page.navigate("https://example.com/dashboard");

        page.screenshot(new Page.ScreenshotOptions()
            .setPath(Paths.get("screenshots/dashboard.png"))
            .setFullPage(true));

        Locator clock = page.getByTestId("live-clock");
        assertThat(page).hasScreenshot("dashboard.png", new PageAssertions.HasScreenshotOptions()
            .setMaxDiffPixelRatio(0.02)
            .setMask(List.of(clock)));
    }
}
```

---

## 3. Console & Error Monitoring

```java
package com.example.playwright;

import java.util.ArrayList;
import java.util.List;
import com.microsoft.playwright.Page;

public class ErrorMonitoringExamples {
    public static void monitorErrors(Page page) {
        List<String> pageErrors = new ArrayList<>();
        page.onPageError(pageErrors::add);

        page.navigate("https://example.com/dashboard");
        assert pageErrors.isEmpty();
    }
}
```
