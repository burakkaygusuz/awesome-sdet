---
name: selenium-java-actions-api
description: Use for Java Selenium tasks involving low-level user interactions via the Actions API (org.openqa.selenium.interactions.Actions) — mouse hover, drag-and-drop, right-click (contextClick), double-click, click-and-hold, key shortcuts (Control/Command key combos), scroll wheel actions, or pen/touch gestures. Trigger on mentions of Actions, Action, PointerInput, KeyInput, WheelInput, dragAndDrop, moveToElement, contextClick, clickAndHold, or scrollByAmount.
metadata:
  keywords: ['selenium', 'actions-api', 'interactions', 'java', 'testing']
---

# Actions API — Selenium Java

## Source & scope

Condensed from official Selenium documentation (`selenium.dev/documentation/webdriver/actions_api/`) and Javadoc for `org.openqa.selenium.interactions.Actions`. The Actions API allows simulating precise composite inputs (keyboard, mouse, scroll wheel, pen). Code examples use Selenium 4 and JUnit 5 (`org.junit.jupiter.api.Assertions`).

## Core building blocks

| Type           | Role                                                                                                |
| :------------- | :-------------------------------------------------------------------------------------------------- |
| `Actions`      | Main builder interface (`new Actions(driver)`). Chains input actions and executes via `.perform()`. |
| `Action`       | Single compiled action sequence returned by `actions.build()`.                                      |
| `PointerInput` | Low-level pointer device abstraction (mouse, pen, touch).                                           |
| `KeyInput`     | Low-level keyboard input device abstraction.                                                        |
| `WheelInput`   | Low-level scroll wheel input device abstraction.                                                    |

## Recipe 1 — Mouse hover, context click, and double click

```java
import org.openqa.selenium.interactions.Actions;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;

Actions actions = new Actions(driver);
WebElement target = driver.findElement(By.id("menu-item"));

// Hover over element, right click, and perform
actions.moveToElement(target)
       .contextClick()
       .perform();
```

## Recipe 2 — Drag and drop

```java
WebElement source = driver.findElement(By.id("draggable"));
WebElement target = driver.findElement(By.id("droppable"));

new Actions(driver)
    .dragAndDrop(source, target)
    .perform();
```

## Recipe 3 — Keyboard shortcuts and key combinations

```java
import org.openqa.selenium.Keys;

// Control + A (Select All) and Backspace
new Actions(driver)
    .keyDown(Keys.CONTROL)
    .sendKeys("a")
    .keyUp(Keys.CONTROL)
    .sendKeys(Keys.BACK_SPACE)
    .perform();
```

## Recipe 4 — Scroll wheel actions

```java
WebElement footer = driver.findElement(By.id("footer"));

// Scroll element into view or scroll by pixel amount
new Actions(driver)
    .scrollToElement(footer)
    .perform();
```

## Best practices

1. **Always call `.perform()`**: Action chains do nothing until `.perform()` is invoked at the end of the chain.
2. **Prefer high-level methods**: Use `dragAndDrop(source, target)` instead of manual `clickAndHold` + `moveToElement` + `release` unless custom offsets are required.
3. **Reset state**: Complex action chains automatically release keys, but explicit `actions.release().perform()` can clear active mouse state if needed.

## Dynamic MCP Support & Reference (Optional)

This skill is fully self-contained. If the `sdet-mcp` server is available in your workspace, you can dynamically query multi-language Actions API code references (Java, Python, TypeScript, C#, Ruby) via the `read_se_actions_docs` tool.
