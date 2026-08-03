---
name: selenium-java-thread-safety
description: Implementation guide for enterprise thread safety and parallel test execution in Selenium Java using ThreadLocal<WebDriver>, DriverFactory pattern, TestNG/JUnit 5 parallel execution, enterprise proxy configuration, and SSL certificate bypass. Trigger on ThreadLocal, thread safety, parallel execution, DriverFactory, TestNG parallel, JUnit 5 parallel, or enterprise proxy setup.
metadata:
  keywords: ['selenium', 'java', 'thread-local', 'parallel-execution', 'driver-factory', 'testing']
---

# Enterprise Thread Safety & Parallel Execution — Selenium Java

## Source & scope

Best practices for thread-safe WebDriver management in multi-threaded TestNG and JUnit 5 parallel test execution suites. Code examples use Java 17+, Selenium 4, and `ThreadLocal<WebDriver>`.

## Core concepts

WebDriver instances are **not thread-safe**. Sharing a single `WebDriver` reference across parallel test threads leads to race conditions, mixed browser state, and unpredictable test crashes. Use `ThreadLocal<WebDriver>` inside a `DriverFactory`.

## DriverFactory Pattern with ThreadLocal

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;

public class DriverFactory {
  private static final ThreadLocal<WebDriver> driverThreadLocal = new ThreadLocal<>();

  public static void initDriver() {
    ChromeOptions options = new ChromeOptions();
    options.addArguments("--headless=new", "--no-sandbox", "--disable-dev-shm-usage");
    WebDriver driver = new ChromeDriver(options);
    driverThreadLocal.set(driver);
  }

  public static WebDriver getDriver() {
    return driverThreadLocal.get();
  }

  public static void quitDriver() {
    if (driverThreadLocal.get() != null) {
      driverThreadLocal.get().quit();
      driverThreadLocal.remove(); // Prevent memory leaks in thread pools
    }
  }
}
```

## Test Framework Lifecycle Integration

### JUnit 5 Extension Integration

```java
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeEachCallback;
import org.junit.jupiter.api.extension.ExtensionContext;

public class WebDriverExtension implements BeforeEachCallback, AfterEachCallback {
  @Override
  public void beforeEach(ExtensionContext context) {
    DriverFactory.initDriver();
  }

  @Override
  public void afterEach(ExtensionContext context) {
    DriverFactory.quitDriver();
  }
}
```

Usage in parallel JUnit 5 test class:

```java
@Execution(ExecutionMode.CONCURRENT)
@ExtendWith(WebDriverExtension.class)
class ParallelTests {
  @Test
  void testOne() {
    DriverFactory.getDriver().get("https://example.com");
  }

  @Test
  void testTwo() {
    DriverFactory.getDriver().get("https://selenium.dev");
  }
}
```

## Best practices

1. **Always call `.remove()` on ThreadLocal**: Calling `driver.quit()` is not enough; you MUST invoke `ThreadLocal.remove()` to prevent thread pool memory leaks.
2. **Use Headless Mode in CI**: Use `--headless=new` in CI pipelines for maximum throughput during parallel execution.

## Dynamic MCP Support & Reference (Optional)

This skill is fully self-contained. If the `sdet-mcp` server is available in your workspace, you can dynamically query multi-language thread safety code references via the `read_se_grid_docs` tool.
