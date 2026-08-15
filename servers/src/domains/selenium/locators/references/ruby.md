# Selenium Locator Strategies — Ruby API Reference (Selenium 4.x+)

> Official Selenium 4 Ruby WebDriver binding (`selenium-webdriver`) locator strategies & relative locators.

---

## Code Examples

```ruby
# frozen_string_literal: true

require 'selenium-webdriver'

class LocatorExamples
  USERNAME_INPUT = { id: 'username' }.freeze
  SUBMIT_BUTTON  = { css: "button[type='submit']" }.freeze

  def initialize(driver)
    @driver = driver
  end

  def demonstrate_locators
    # 1. Standard Hash Locators
    username   = @driver.find_element(USERNAME_INPUT)
    submit_btn = @driver.find_element(SUBMIT_BUTTON)

    # 2. Selenium 4 Relative Locators (Spatial) — Ruby uses the :relative hash form
    password_input = @driver.find_element({ relative: { tag_name: 'input', below: username } })

    cancel_button = @driver.find_element(
      { relative: { tag_name: 'button', to_left_of: submit_btn } }
    )

    [password_input, cancel_button]
  end
end
```

## Best Practices

- **Freeze Locator Hashes**: Define locator constants as frozen hashes (e.g. `{ id: 'username' }.freeze`) to prevent mutation.
- **Hash Form**: Ruby relative locators use the `:relative` hash (`find_element({ relative: { tag_name: 'input', below: el } })`); there is no builder DSL in the Ruby bindings.
- **Spatial Locator Names**: Use correct Selenium 4 spatial relative locator method names (`to_left_of`, `to_right_of`, `above`, `below`, `near`).

## Shadow DOM Piercing

Selenium 4 exposes open shadow roots via `getShadowRoot()`; query inside them with standard locators:

```ruby
shadow_host = @driver.find_element(css: 'my-card')
shadow_root = shadow_host.shadow_root
inner = shadow_root.find_element(css: 'p')
nested_root = shadow_root.find_element(css: 'child-widget').shadow_root
```

## Link Text Strategies

Anchor-only strategies: `find_element(link_text: 'Sign in')` / `find_element(partial_link_text: 'Sign')`.
