# Selenium Event Interception & Decorators — Ruby API Reference (Selenium 4.46.0+)

> Custom Driver & Element Decorator patterns in Selenium 4 Ruby (replacing removed `AbstractEventListener`).

---

## Code Examples

```ruby
# frozen_string_literal: true

require 'selenium-webdriver'
require 'delegate'

# Custom Driver Decorator Pattern for Selenium 4
class LoggingDriver < SimpleDelegator
  def navigate
    puts '[LOG] Accessing navigation...'
    super
  end

  def find_element(*args)
    puts "[LOG] Finding element with: #{args.inspect}"
    element = super
    LoggingElement.new(element)
  end
end

class LoggingElement < SimpleDelegator
  def click
    puts "[LOG] Clicking element: #{inspect}"
    super
  end
end

def demonstrate_logging_wrapper
  raw_driver = Selenium::WebDriver.for(:chrome)
  driver = LoggingDriver.new(raw_driver)

  begin
    driver.navigate.to('https://example.com')
    btn = driver.find_element(tag_name: 'button')
    btn.click
  ensure
    raw_driver&.quit
  end
end
```

## Best Practices

- **Avoid Removed APIs**: `AbstractEventListener` and `EventFiringWebDriver` were removed in Selenium 4; use wrapper/decorator patterns instead.
- **Use SimpleDelegator**: Leverage Ruby's `delegate` library or `SimpleDelegator` to cleanly wrap `Selenium::WebDriver::Driver` and `Selenium::WebDriver::Element`.
- **Non-blocking Interception**: Keep loggers and interceptors lightweight so test pipeline throughput is preserved.
