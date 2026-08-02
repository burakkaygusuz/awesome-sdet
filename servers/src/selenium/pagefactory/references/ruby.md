# Page Object Model (POM) - Ruby API Reference

> Official Selenium WebDriver Ruby Binding (`selenium-webdriver`) Page Object Patterns.

---

## Ruby Page Object Pattern

```ruby
require 'selenium-webdriver'

class LoginPage
  USERNAME_INPUT = { id: 'username' }
  PASSWORD_INPUT = { id: 'password' }
  LOGIN_BUTTON   = { css: "button[type='submit']" }

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

## Best Practices for Ruby Selenium POM

1. **Hash Locators**: Define locator constants as `{ id: 'username' }` or `{ css: 'button' }`.
2. **Method Chaining**: Return `self` from input wrapper methods.
3. **Explicit Wait Blocks**: Use `@wait.until { @driver.find_element(...) }` for robust element location.
