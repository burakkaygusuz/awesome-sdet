# Selenium Event Listeners — Java API Reference (Selenium 4.x+)

> Official Selenium 4 Java EventFiringDecorator and WebDriverListener (`org.openqa.selenium.support.events`).

---

## Code Examples

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.events.EventFiringDecorator;
import org.openqa.selenium.support.events.WebDriverListener;

public class ListenerExamples {

    public static class CustomLoggingListener implements WebDriverListener {
        @Override
        public void beforeClick(WebElement element) {
            System.out.println("Clicking element: " + element);
        }
    }

    public void demonstrateListeners(WebDriver driver) {
        WebDriverListener listener = new CustomLoggingListener();
        WebDriver decoratedDriver = new EventFiringDecorator<>(listener).decorate(driver);

        decoratedDriver.get("https://example.com");
    }
}
```

## Best Practices

- **Use EventFiringDecorator over EventFiringWebDriver**: Selenium 4 deprecates `EventFiringWebDriver` in favor of `EventFiringDecorator`.
- **Implement specific listener hooks**: Override only necessary methods in `WebDriverListener` (e.g. `beforeClick`, `afterNavigateTo`).
- **Decorate early**: Wrap the `WebDriver` instance immediately after instantiation.
