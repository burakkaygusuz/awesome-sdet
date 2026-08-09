# Selenium Actions API — Python API Reference (Selenium 4.x+)

> Official Selenium 4 Python ActionChains (`selenium.webdriver.common.action_chains.ActionChains`).

---

## Code Examples

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.remote.webdriver import WebDriver

class ActionsExamples:

    def demonstrate_actions(self, driver: WebDriver) -> None:
        actions = ActionChains(driver)

        source = driver.find_element(By.ID, "draggable")
        target = driver.find_element(By.ID, "droppable")

        actions.move_to_element(target).context_click().perform()
        actions.double_click(source).perform()
        actions.drag_and_drop(source, target).perform()

        # Shortcut: Select All (Ctrl+A)
        actions.key_down(Keys.CONTROL).send_keys("a").key_up(Keys.CONTROL).perform()

        actions.scroll_to_element(target).perform()
```

## Best Practices

- **Always call `.perform()`**: ActionChains methods only build the action sequence; `.perform()` executes it.
- **Prefer composite methods**: Use `drag_and_drop(source, target)` instead of manual click-hold-move-release.
- **Scroll into view**: Use `scroll_to_element(element)` before clicking elements outside the viewport.
