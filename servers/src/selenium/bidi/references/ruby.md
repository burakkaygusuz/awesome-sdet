# WebDriver BiDi Protocol — Ruby API Reference (Selenium 4.46.0+)

> Official Selenium 4 Ruby WebDriver BiDi (`bidi`).

---

## Code Examples

```ruby
require 'selenium-webdriver'

def demonstrate_bidi
  options = Selenium::WebDriver::Options.chrome(web_socket_url: true)
  driver = Selenium::WebDriver.for(:chrome, options: options)

  bidi = driver.bidi

  bidi.log.on_console_entry do |entry|
    puts "Console entry: #{entry.text}"
  end
end
```

## Best Practices

- **Enable BiDi Capability**: Pass `web_socket_url: true` in driver options to enable BiDi.
- **Use BiDi over CDP**: BiDi provides standard cross-browser bidirectional event streams.
- **Clean up listeners**: Ensure event handlers are properly detached after test completion.
