# WebDriver BiDi Protocol — Java API Reference (Selenium 4.x+)

> Official Selenium 4 Java WebDriver BiDi (`org.openqa.selenium.bidi`).

---

## Enabling BiDi

```java
FirefoxOptions options = new FirefoxOptions();
options.setCapability("webSocketUrl", true);
WebDriver driver = new FirefoxDriver(options);
```

---

## Code Examples

```java
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.firefox.FirefoxDriver;
import org.openqa.selenium.firefox.FirefoxOptions;
import org.openqa.selenium.bidi.module.LogInspector;
import org.openqa.selenium.bidi.module.Network;
import org.openqa.selenium.bidi.network.AddInterceptParameters;
import org.openqa.selenium.bidi.network.InterceptPhase;

public class BidiExamples {

    public void demonstrateBidi() {
        FirefoxOptions options = new FirefoxOptions();
        options.setCapability("webSocketUrl", true);

        WebDriver driver = new FirefoxDriver(options);
        try {
            try (Network network = new Network(driver)) {
                String intercept = network.addIntercept(
                        new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));
                network.onBeforeRequestSent(
                        details -> System.out.println("Request: " + details.getRequest().getUrl()));
                network.removeIntercept(intercept);
            }

            try (LogInspector logInspector = new LogInspector(driver)) {
                logInspector.onConsoleEntry(entry -> System.out.println("Log: " + entry.getText()));
                driver.get("https://www.selenium.dev/selenium/web/bidi/logEntryAdded.html");
                driver.findElement(By.id("consoleLog")).click();
            }
        } finally {
            driver.quit();
        }
    }
}
```

## Best Practices

- **Enable BiDi capability**: Set `"webSocketUrl"` to `true` on browser options before session creation.
- **Use try-with-resources**: Wrap `Network` and `LogInspector` in try-with-resources blocks for automatic cleanup.
- **Use BiDi over CDP**: BiDi is the W3C cross-browser standard supported on Chrome, Edge, and Firefox.
- **Remove intercepts explicitly**: Call `network.removeIntercept(interceptId)` when intercepts are no longer needed.
