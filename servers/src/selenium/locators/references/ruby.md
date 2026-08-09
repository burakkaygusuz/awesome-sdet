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

    # 2. Selenium 4 Relative Locators (Spatial)
    password_input = @driver.find_element(
      Selenium::WebDriver::RelativeLocator.with(tag_name: 'input').below(username)
    )

    cancel_button = @driver.find_element(
      Selenium::WebDriver::RelativeLocator.with(tag_name: 'button').to_left_of(submit_btn)
    )

    [password_input, cancel_button]
  end
end
```

## Best Practices

- **Freeze Locator Hashes**: Define locator constants as frozen hashes (e.g. `{ id: 'username' }.freeze`) to prevent mutation.
- **Keyword Arguments**: Pass keyword arguments directly to `RelativeLocator.with(tag_name: 'input')` without redundant hash wrapper braces.
- **Spatial Locator Names**: Use correct Selenium 4 spatial relative locator method names (`to_left_of`, `to_right_of`, `above`, `below`, `near`).
