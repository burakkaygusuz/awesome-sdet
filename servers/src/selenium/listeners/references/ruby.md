# Selenium Event Listeners — Ruby API Reference (Selenium 4.46.0+)

> Official Selenium 4 Ruby AbstractEventListener (`Selenium::WebDriver::Support::AbstractEventListener`).

---

## Code Examples

```ruby
require 'selenium-webdriver'

class CustomEventListener < Selenium::WebDriver::Support::AbstractEventListener
  def before_navigate_to(url, driver)
    puts "Navigating to #{url}"
  end
end

def demonstrate_listener(original_driver)
  listener = CustomEventListener.new
  driver = Selenium::WebDriver.for(:chrome, listener: listener)
end
```

## Best Practices

- **Inherit AbstractEventListener**: Extend `Selenium::WebDriver::Support::AbstractEventListener` to override only required hooks.
- **Non-blocking Callbacks**: Keep event hooks fast so command execution pipeline is not delayed.
- **Clean Teardown**: Ensure listener instances are disposed of cleanly when driver quits.
