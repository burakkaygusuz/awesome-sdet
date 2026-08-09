# Selenium Actions API — Ruby API Reference (Selenium 4.x+)

> Official Selenium 4 Ruby ActionBuilder (`driver.action`).

---

## Code Examples

```ruby
# frozen_string_literal: true

require 'selenium-webdriver'

def demonstrate_actions(driver)
  source = driver.find_element(id: 'draggable')
  target = driver.find_element(id: 'droppable')

  # Composite mouse actions
  driver.action.move_to(target).context_click.perform
  driver.action.drag_and_drop(source, target).perform

  # Shortcut: Select All (Ctrl+A / Cmd+A)
  modifier = RUBY_PLATFORM.match?(/darwin/i) ? :command : :control
  driver.action.key_down(modifier).send_keys('a').key_up(modifier).perform

  # Scroll operation (Selenium 4.2+)
  driver.action.scroll_to(target).perform
end
```

## Best Practices

- **Always call `.perform`**: Action builder methods accumulate steps; `.perform` executes the sequence.
- **Prefer composite methods**: Use `drag_and_drop(source, target)` instead of manual click-hold-move-release.
- **Scroll into view**: Use `scroll_to(element)` before performing pointer operations on off-screen targets.
