---
name: selenium-java-explicit-waits
description: Reference and implementation guide for Selenium Java explicit waits using WebDriverWait and ExpectedConditions (org.openqa.selenium.support.ui.ExpectedConditions). Trigger on mentions of explicit waits, ExpectedConditions, WebDriverWait, FluentWait, test synchronization, replacing Thread.sleep, resolving flaky tests, or handling exceptions like StaleElementReferenceException, ElementNotInteractableException, and ElementClickInterceptedException.
metadata:
  keywords:
    ['selenium', 'java', 'explicit-waits', 'expected-conditions', 'webdriverwait', 'testing']
---

# ExpectedConditions & Explicit Waits — Selenium Java

## Source & scope

Condensed from official Selenium documentation (`selenium.dev/documentation/webdriver/waits/`) and Javadoc for `org.openqa.selenium.support.ui.ExpectedConditions` and `WebDriverWait`. Code examples use Selenium 4 and Java `java.time.Duration`.

## Core concepts

**ExpectedConditions** are predefined conditions used with `WebDriverWait.until()`. They return an object (usually `Boolean`, `WebElement`, or `Alert`) when the condition is met, or `null`/`false` if not.

### Basic pattern

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("target")));
```

## Method categories

| Category          | Key Methods                                                    | Description                                                    |
| :---------------- | :------------------------------------------------------------- | :------------------------------------------------------------- |
| **Visibility**    | `visibilityOf`, `visibilityOfElementLocated`, `invisibilityOf` | Check if elements are rendered and visible to the user.        |
| **Presence**      | `presenceOfElementLocated`, `presenceOfAllElementsLocatedBy`   | Check if elements exist in the DOM (regardless of visibility). |
| **Interactivity** | `elementToBeClickable`, `elementToBeSelected`                  | Check if elements are enabled and ready for interaction.       |
| **Text/Title**    | `textToBe`, `titleIs`, `urlContains`                           | Validate text content, page titles, or URL fragments.          |
| **Attributes**    | `attributeToBe`, `domAttributeToBe`, `domPropertyToBe`         | Check for specific values in element attributes or properties. |
| **Logic**         | `and`, `or`, `not`                                             | Combine multiple conditions for complex synchronization.       |
| **Frames/Alerts** | `frameToBeAvailableAndSwitchToIt`, `alertIsPresent`            | Handle switching to frames or waiting for alerts.              |

## Best practices

1. **Prefer Visibility over Presence:** Use `visibilityOfElementLocated` instead of `presenceOfElementLocated` when you intend to click or type into an element.
2. **Avoid Thread.sleep:** Always use `ExpectedConditions` with `WebDriverWait` for more efficient and reliable tests.
3. **Handle Staleness:** Wrap conditions in `refreshed()` if the element is likely to be redrawn during the wait.
4. **Static Imports:** Use `import static org.openqa.selenium.support.ui.ExpectedConditions.*;` to make your code more readable.

## Common recipes & workflows

### Recipe 1 — Waiting for a page load

```java
wait.until(and(
    titleContains("Dashboard"),
    urlContains("/home"),
    visibilityOfElementLocated(By.id("main-content"))
));
```

### Recipe 2 — Handling dynamic lists

```java
wait.until(numberOfElementsToBeMoreThan(By.className("list-item"), 0));
```

### Recipe 3 — Handling stale elements with `refreshed()`

```java
WebElement element = driver.findElement(By.id("dynamic-element"));
wait.until(refreshed(ExpectedConditions.elementToBeClickable(element)));
// Now 'element' refers to the re-attached element, safe to interact
element.click();
```

## Dynamic Tool Schemas & API Reference

Complete list of supported `ExpectedConditions` methods, parameters, and locator strategies are exposed dynamically via the `sdet-mcp` server (`execute_se_explicit_wait` tool).
