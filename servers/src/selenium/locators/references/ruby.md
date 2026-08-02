# Selenium Locator Strategies — Ruby API Reference (Ruby 3.0+ & Selenium 4.46.0+)

> Official Selenium 4 Ruby WebDriver binding (`selenium-webdriver`) locator strategies & spatial locators.

---

## Code Examples

```ruby
require 'selenium-webdriver'

class LocatorExamples
  USERNAME_INPUT = { id: 'username' }
  SUBMIT_BUTTON  = { css: "button[type='submit']" }

  def initialize(driver)
    @driver = driver
  end

  def demonstrate_locators
    # 1. Standard Hash Locators
    username   = @driver.find_element(USERNAME_INPUT)
    submit_btn = @driver.find_element(SUBMIT_BUTTON)

    # 2. Selenium 4 Relative Locators (Spatial)
    password_input = @driver.find_element(
      Selenium::WebDriver::RelativeLocator.with({ tag_name: 'input' }).below(username)
    )
    cancel_button = @driver.find_element(
      Selenium::WebDriver::RelativeLocator.with({ tag_name: 'button' }).left(submit_btn)
    )
  end
end
```
