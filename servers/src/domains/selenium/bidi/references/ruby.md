# WebDriver BiDi Protocol — Ruby API Reference (Selenium 4.x+)

> Official Selenium 4 Ruby WebDriver BiDi (`bidi`) & LogInspector implementation.

---

## Code Examples

```ruby
# frozen_string_literal: true

require 'selenium-webdriver'

def demonstrate_bidi
  options = Selenium::WebDriver::Options.chrome(web_socket_url: true)
  driver = Selenium::WebDriver.for(:chrome, options: options)

  # Selenium 4 BiDi LogInspector for real-time console log monitoring
  log_inspector = Selenium::WebDriver::BiDi::LogInspector.new(driver)

  log_inspector.on_console_entry do |entry|
    puts "Console entry [#{entry.type}]: #{entry.text}"
  end

  driver.get('https://example.com')
ensure
  driver&.quit
end
```

## Best Practices

- **Enable BiDi Capability**: Pass `web_socket_url: true` in driver options to enable WebDriver BiDi.
- **Use LogInspector**: Utilize `Selenium::WebDriver::BiDi::LogInspector` for asynchronous event handling rather than legacy log polling.
- **Use BiDi over CDP**: BiDi provides standard cross-browser bidirectional event streams across Chrome, Firefox, and Edge.
- **Ensure Resource Cleanup**: Always wrap session execution in `begin...ensure` blocks to guarantee `driver.quit` releases BiDi sockets.
