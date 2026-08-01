---
name: selenium-java-explicit-waits
description: 'Reference and implementation guide for Selenium Java explicit waits using WebDriverWait and ExpectedConditions (org.openqa.selenium.support.ui.ExpectedConditions). Use when writing or debugging Selenium or Appium Java tests involving test synchronization, replacing Thread.sleep, resolving flaky tests, or handling exceptions like StaleElementReferenceException, ElementNotInteractableException, and ElementClickInterceptedException.'
metadata:
  keywords:
    ['selenium', 'java', 'explicit-waits', 'expected-conditions', 'webdriverwait', 'testing']
---

# Selenium ExpectedConditions (Java)

This skill provides a complete reference for the `org.openqa.selenium.support.ui.ExpectedConditions` class in Java. These conditions are essential for creating robust, non-flaky Selenium tests by synchronizing the driver's state with the browser's state.

## Core Concepts

**ExpectedConditions** are predefined conditions used with `WebDriverWait.until()`. They return an object (usually `Boolean`, `WebElement`, or `Alert`) when the condition is met, or `null/false` if not.

### Basic Pattern

```java
WebDriverWait wait = new WebDriverWait(driver, Duration.ofSeconds(10));
WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(By.id("target")));
```

## Method Categories

| Category          | Key Methods                                                    | Description                                                    |
| :---------------- | :------------------------------------------------------------- | :------------------------------------------------------------- |
| **Visibility**    | `visibilityOf`, `visibilityOfElementLocated`, `invisibilityOf` | Check if elements are rendered and visible to the user.        |
| **Presence**      | `presenceOfElementLocated`, `presenceOfAllElementsLocatedBy`   | Check if elements exist in the DOM (regardless of visibility). |
| **Interactivity** | `elementToBeClickable`, `elementToBeSelected`                  | Check if elements are enabled and ready for interaction.       |
| **Text/Title**    | `textToBe`, `titleIs`, `urlContains`                           | Validate text content, page titles, or URL fragments.          |
| **Attributes**    | `attributeToBe`, `domAttributeToBe`, `domPropertyToBe`         | Check for specific values in element attributes or properties. |
| **Logic**         | `and`, `or`, `not`                                             | Combine multiple conditions for complex synchronization.       |
| **Frames/Alerts** | `frameToBeAvailableAndSwitchToIt`, `alertIsPresent`            | Handle switching to frames or waiting for alerts.              |

> **Dynamic Tool Schemas & Enums:** The complete list of 25+ supported `ExpectedConditions` and locator strategies is served dynamically by the `awesome-sdet-selenium-mcp` server (`execute_selenium_wait` tool).

## Best Practices

1.  **Prefer Visibility over Presence:** Use `visibilityOfElementLocated` instead of `presenceOfElementLocated` when you intend to click or type into an element.
2.  **Avoid Thread.sleep:** Always use `ExpectedConditions` with `WebDriverWait` for more efficient and reliable tests.
3.  **Handle Staleness:** Wrap conditions in `refreshed()` if the element is likely to be redrawn during the wait.
4.  **Static Imports:** Use `import static org.openqa.selenium.support.ui.ExpectedConditions.*;` to make your code more readable.

## Common Workflows

### Waiting for a Page Load

```java
wait.until(and(
    titleContains("Dashboard"),
    urlContains("/home"),
    visibilityOfElementLocated(By.id("main-content"))
));
```

### Handling Dynamic Lists

```java
wait.until(numberOfElementsToBeMoreThan(By.className("list-item"), 0));
```

### Handling Stale Elements with `refreshed()`

```java
WebElement element = driver.findElement(By.id("dynamic-element"));
wait.until(refreshed(ExpectedConditions.elementToBeClickable(element)));
// Now 'element' refers to the re-attached element, safe to interact
element.click();
```
