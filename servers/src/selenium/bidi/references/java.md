# WebDriver BiDi Protocol — Java API Reference (Selenium 4.46.0+)

> Official Selenium 4 Java WebDriver BiDi (`org.openqa.selenium.bidi`).

---

## Code Examples

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.bidi.HasBiDi;
import org.openqa.selenium.bidi.BiDi;
import org.openqa.selenium.bidi.module.LogInspector;
import org.openqa.selenium.bidi.module.Network;

public class BidiExamples {

    public void demonstrateBidi() {
        ChromeOptions options = new ChromeOptions();
        options.setCapability(CapabilityType.ENABLE_BIDI, true);

        WebDriver driver = new ChromeDriver(options);

        BiDi bidi = ((HasBiDi) driver).getBiDi();

        LogInspector inspector = new LogInspector(driver);
        inspector.onConsoleEntry(entry -> System.out.println("Log: " + entry.getText()));

        Network network = new Network(driver);
    }
}
```

## Best Practices

- **Enable BiDi Capability**: BiDi options (`CapabilityType.ENABLE_BIDI` or `"webSocketUrl"`) must be set on `ChromeOptions`, `FirefoxOptions`, or `EdgeOptions` before session creation.
- **Use HasBiDi Interface**: Access lower-level BiDi session commands using `((HasBiDi) driver).getBiDi()`.
- **Use BiDi over CDP**: BiDi is the W3C cross-browser standard supported on Chrome, Edge, and Firefox.
- **Clean up listeners**: Detach event listeners on test teardown to prevent memory leaks in persistent browser sessions.
