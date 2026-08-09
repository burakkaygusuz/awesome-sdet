# Page Object Model (POM) — Ruby API Reference (Selenium 4.x+)

> Official Selenium WebDriver Ruby Binding (`selenium-webdriver`) Page Object Patterns.

---

## Code Examples

```ruby
# frozen_string_literal: true

require 'selenium-webdriver'

class LoginPage
  USERNAME_INPUT = { id: 'username' }.freeze
  PASSWORD_INPUT = { id: 'password' }.freeze
  LOGIN_BUTTON   = { css: "button[type='submit']" }.freeze

  def initialize(driver, timeout: 10)
    @driver = driver
    @wait   = Selenium::WebDriver::Wait.new(timeout: timeout)
  end

  def enter_username(username)
    element = @wait.until { @driver.find_element(USERNAME_INPUT) }
    element.clear
    element.send_keys(username)
    self
  end

  def enter_password(password)
    element = @wait.until { @driver.find_element(PASSWORD_INPUT) }
    element.clear
    element.send_keys(password)
    self
  end

  def click_login
    button = @wait.until { @driver.find_element(LOGIN_BUTTON) }
    button.click
  end

  def login(username, password)
    enter_username(username)
    enter_password(password)
    click_login
  end
end
```

---

## Best Practices

1. **Hash Locators**: Define locator constants as frozen hashes (e.g. `{ id: 'username' }.freeze`).
2. **Method Chaining**: Return `self` from input wrapper methods.
3. **Explicit Wait Blocks**: Use `@wait.until { @driver.find_element(...) }` with keyword argument `timeout: 10` for robust element location.
