---
name: selenium-java-shadow-root
description: Reference and implementation guide for Selenium 4 Shadow DOM automation, SearchContext.getShadowRoot(), nested shadow root navigation, and Web Components element interaction. Trigger on Shadow DOM, shadow root, getShadowRoot, SearchContext, Web Components, or inspecting shadow root elements in Selenium Java.
metadata:
  keywords: ['selenium', 'java', 'shadow-dom', 'shadow-root', 'web-components', 'testing']
---

# Shadow DOM & Web Components — Selenium Java

## Source & scope

Condensed from official Selenium documentation (`selenium.dev/documentation/webdriver/elements/finders/`). Explains how to inspect Web Components and Shadow DOM subtrees in Selenium 4 (4.46.0+) using `SearchContext.getShadowRoot()`. Code examples use Java 17+ and JUnit 5 (`org.junit.jupiter.api.Assertions`).

## Core concepts

In Selenium 4, `SearchContext` is implemented by `WebDriver`, `WebElement`, and `ShadowRoot`. To locate elements hidden inside a Shadow DOM, first find the shadow host element, invoke `.getShadowRoot()` to get a `SearchContext`, and then locate target elements from that context.

```java
WebElement shadowHost = driver.findElement(By.cssSelector("#shadow-host"));
SearchContext shadowRoot = shadowHost.getShadowRoot();
WebElement shadowContent = shadowRoot.findElement(By.cssSelector(".shadow-content"));
```

## Recipes

### Recipe 1 — Interacting with elements inside a single Shadow Root

```java
import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;

WebDriver driver = new ChromeDriver();
driver.get("https://example.com/web-components");

WebElement shadowHost = driver.findElement(By.cssSelector("custom-button"));
SearchContext shadowRoot = shadowHost.getShadowRoot();

WebElement internalButton = shadowRoot.findElement(By.cssSelector("button.inner-btn"));
internalButton.click();
```

### Recipe 2 — Navigating nested (multi-level) Shadow DOM trees

```java
import org.openqa.selenium.By;
import org.openqa.selenium.SearchContext;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

// Parent Shadow Host
WebElement outerHost = driver.findElement(By.cssSelector("outer-component"));
SearchContext outerRoot = outerHost.getShadowRoot();

// Nested Child Shadow Host inside outer root
WebElement innerHost = outerRoot.findElement(By.cssSelector("inner-component"));
SearchContext innerRoot = innerHost.getShadowRoot();

// Target element inside inner shadow root
WebElement targetInput = innerRoot.findElement(By.cssSelector("input#user-email"));
targetInput.sendKeys("user@example.com");
```

## Best practices

1. **Use CSS Selectors inside ShadowRoot**: The W3C WebDriver specification explicitly forbids XPath queries directly on a `ShadowRoot` context. Always use `By.cssSelector()` inside a shadow root.
2. **Ensure element is attached**: Dynamic Web Components may re-render shadow roots asynchronously; use explicit wait polling on the host element if needed before calling `.getShadowRoot()`.

## Dynamic MCP Support & Reference (Optional)

This skill is fully self-contained. If the `sdet-mcp` server is available in your workspace, you can dynamically query multi-language locator and element inspection references via the `read_se_locator_docs` tool.
