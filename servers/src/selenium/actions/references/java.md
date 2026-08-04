# Selenium Actions API — Java API Reference (Selenium 4.46.0+)

> Official Selenium 4 Java Actions API (`org.openqa.selenium.interactions.Actions`).

---

## Code Examples

```java
import org.openqa.selenium.By;
import org.openqa.selenium.Keys;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.interactions.Actions;

public class ActionsExamples {

    public void demonstrateActions(WebDriver driver) {
        Actions actions = new Actions(driver);

        WebElement source = driver.findElement(By.id("draggable"));
        WebElement target = driver.findElement(By.id("droppable"));

        actions.moveToElement(target).contextClick().perform();
        actions.doubleClick(source).perform();
        actions.dragAndDrop(source, target).perform();

        // Shortcut: Select All (Ctrl+A)
        actions.keyDown(Keys.CONTROL).sendKeys("a").keyUp(Keys.CONTROL).perform();

        actions.scrollToElement(target).perform();
    }
}
```

## Best Practices

- **Always call `.perform()`**: Actions methods build the action sequence; `.perform()` executes it.
- **Prefer composite methods**: Use `dragAndDrop(source, target)` instead of manual click-and-hold sequences.
- **Scroll into view**: Use `scrollToElement(target)` before clicking elements outside the viewport.
