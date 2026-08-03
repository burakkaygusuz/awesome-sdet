# Selenium Actions API — C# API Reference (Selenium 4.46.0+)

> Official Selenium 4 C# Actions API (`OpenQA.Selenium.Interactions.Actions`).

---

## Code Examples

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Interactions;

public class ActionsExamples
{
    public void DemonstrateActions(IWebDriver driver)
    {
        var actions = new Actions(driver);
        var source = driver.FindElement(By.Id("draggable"));
        var target = driver.FindElement(By.Id("droppable"));

        // 1. Mouse Hover & Context Click
        actions.MoveToElement(target).ContextClick().Perform();

        // 2. Drag and Drop
        actions.DragAndDrop(source, target).Perform();

        // 3. Keyboard Shortcuts (Control + A)
        actions.KeyDown(Keys.Control).SendKeys("a").KeyUp(Keys.Control).Perform();

        // 4. Scroll Element into View
        actions.ScrollToElement(target).Perform();
    }
}
```

## Best Practices

- **Always call `.Perform()`**: Actions methods only build the sequence; `.Perform()` executes it.
- **Prefer composite methods**: Use `DragAndDrop(source, target)` instead of manual click-hold-move-release.
- **Scroll into view**: Use `ScrollToElement(element)` before interacting with off-screen elements.
