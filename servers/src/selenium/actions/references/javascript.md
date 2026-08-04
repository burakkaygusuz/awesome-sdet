# Selenium Actions API — JavaScript API Reference (Selenium 4.46.0+)

> Official Selenium 4 JavaScript Actions API (`selenium-webdriver`).

---

## Code Examples

```javascript
const { By, Key } = require('selenium-webdriver');

async function demonstrateActions(driver) {
  const source = await driver.findElement(By.id('draggable'));
  const target = await driver.findElement(By.id('droppable'));

  await driver.actions().move({ origin: target }).contextClick().perform();
  await driver.actions().dragAndDrop(source, target).perform();

  // Shortcut: Select All (Ctrl+A)
  await driver.actions().keyDown(Key.CONTROL).sendKeys('a').keyUp(Key.CONTROL).perform();

  await driver.actions().scroll(0, 0, 0, 0, target).perform();
}

module.exports = { demonstrateActions };
```

## Best Practices

- **Always call `.perform()`**: Action chains do nothing until `.perform()` is awaited.
- **Prefer composite methods**: Use `dragAndDrop(source, target)` instead of manual pointer movements.
- **Scroll into view**: Use `scroll(0, 0, 0, 0, element)` to scroll elements into view before interaction.
