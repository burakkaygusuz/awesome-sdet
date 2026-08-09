# Selenium Actions API — TypeScript API Reference (Selenium 4.x+)

> Official Selenium 4 TypeScript / JavaScript Actions API (`selenium-webdriver`).

---

## Code Examples

```typescript
import { Builder, By, Key, WebDriver } from 'selenium-webdriver';

export async function demonstrateActions(driver: WebDriver): Promise<void> {
  const source = await driver.findElement(By.id('draggable'));
  const target = await driver.findElement(By.id('droppable'));

  await driver.actions().move({ origin: target }).contextClick().perform();
  await driver.actions().dragAndDrop(source, target).perform();

  // Shortcut: Select All (Ctrl+A)
  await driver.actions().keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL).perform();

  await driver.actions().scroll(0, 0, 0, 0, target).perform();
}
```

## Best Practices

- **Always call `.perform()`**: Action chains do nothing until `.perform()` is awaited.
- **Prefer composite methods**: Use `dragAndDrop(source, target)` instead of manual pointer movements.
- **Scroll into view**: Use `scroll(0, 0, 0, 0, element)` to scroll elements into view before interaction.
