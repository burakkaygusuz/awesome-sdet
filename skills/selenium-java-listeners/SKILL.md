---
name: selenium-java-listeners
description: Use for Java Selenium tasks involving driver event listeners and command decoration — org.openqa.selenium.support.events.EventFiringDecorator and WebDriverListener interface. Trigger on mentions of WebDriverListener, EventFiringDecorator, EventFiringWebDriver, listening to driver events, automatic logging of Selenium commands, taking screenshots on failure automatically, or timing command execution.
metadata:
  keywords:
    ['selenium', 'listeners', 'event-firing-decorator', 'webdriver-listener', 'java', 'testing']
---

# EventFiringDecorator & Listeners — Selenium Java

## Source & scope

Condensed from official Selenium documentation (`selenium.dev/documentation/webdriver/support_features/listeners/`) and Javadoc for `org.openqa.selenium.support.events.EventFiringDecorator` and `WebDriverListener`. Introduced in Selenium 4 to replace the legacy `EventFiringWebDriver`. Code examples use Selenium 4 and JUnit 5 (`org.junit.jupiter.api.Assertions`).

## Core building blocks

| Type                   | Role                                                                                                                                                  |
| :--------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WebDriverListener`    | Interface with default empty hooks for before/after every driver and element operation (`beforeClick`, `afterClick`, `onError`, `beforeFindElement`). |
| `EventFiringDecorator` | Generic decorator (`new EventFiringDecorator(listener...).decorate(originalDriver)`). Returns a decorated `WebDriver` proxy.                          |

## Recipe 1 — Custom Logging Listener

```java
import org.openqa.selenium.support.events.WebDriverListener;
import org.openqa.selenium.WebElement;

public class CustomLogger implements WebDriverListener {

    @Override
    public void beforeClick(WebElement element) {
        System.out.println("About to click element: " + element);
    }

    @Override
    public void onError(Object target, java.lang.reflect.Method method, Object[] args, InvocationTargetException e) {
        System.err.println("Error encountered during method: " + method.getName() + " on target: " + target);
    }
}
```

## Recipe 2 — Decorating WebDriver instance

```java
import org.openqa.selenium.support.events.EventFiringDecorator;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

WebDriver originalDriver = new ChromeDriver();
WebDriverListener listener = new CustomLogger();

// Create decorated driver wrapping original instance
WebDriver decoratedDriver = new EventFiringDecorator<>(listener).decorate(originalDriver);

decoratedDriver.get("https://example.com");
```

## Dynamic MCP Support & Reference (Optional)

This skill is fully self-contained. If the `sdet-mcp` server is available in your workspace, you can dynamically query multi-language EventFiringDecorator and listener code references via the `read_se_listeners_docs` tool.
