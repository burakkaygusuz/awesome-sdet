# Selenium Actions API — Ruby API Reference (Selenium 4.46.0+)

> Official Selenium 4 Ruby ActionBuilder (`driver.action`).

---

## Code Examples

```ruby
require 'selenium-webdriver'

def demonstrate_actions(driver)
  source = driver.find_element(id: 'draggable')
  target = driver.find_element(id: 'droppable')

  # 1. Mouse Hover & Context Click
  driver.action.move_to(target).context_click.perform

  # 2. Drag and Drop
  driver.action.drag_and_drop(source, target).perform

  # 3. Keyboard Shortcuts (Control + A)
  driver.action.key_down(:control).send_keys('a').key_up(:control).perform

  # 4. Scroll Element into View
  driver.action.scroll_to(target).perform
end
```

## Best Practices

- **Always call `.perform`**: Action builder methods accumulate steps; `.perform` executes the sequence.
- **Prefer composite methods**: Use `drag_and_drop(source, target)` instead of manual click-hold-move-release.
- **Scroll into view**: Use `scroll_to(element)` before performing pointer operations on off-screen targets.
