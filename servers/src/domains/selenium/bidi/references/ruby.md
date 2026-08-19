# WebDriver BiDi Protocol — Ruby API Reference (Selenium 4.x+)

> Official Selenium 4 Ruby WebDriver BiDi (`driver.script`).

---

## Enabling BiDi

```ruby
options = Selenium::WebDriver::Options.firefox(web_socket_url: true)
driver = Selenium::WebDriver.for(:firefox, options: options)
```

---

## Code Examples

```ruby
# frozen_string_literal: true

require 'selenium-webdriver'

def demonstrate_bidi
  options = Selenium::WebDriver::Options.firefox(web_socket_url: true)
  driver = Selenium::WebDriver.for(:firefox, options: options)
  wait = Selenium::WebDriver::Wait.new(timeout: 5)

  log_entries = []
  handler_id = driver.script.add_console_message_handler { |log| log_entries << log }

  driver.navigate.to 'https://www.selenium.dev/selenium/web/bidi/logEntryAdded.html'
  driver.find_element(id: 'consoleLog').click
  wait.until { log_entries.any? }

  driver.script.remove_console_message_handler(handler_id)
ensure
  driver&.quit
end
```

## Best Practices

- **Enable BiDi capability**: Pass `web_socket_url: true` in driver options to enable WebDriver BiDi.
- **Use `driver.script` namespace**: Utilize `add_console_message_handler` and `add_javascript_error_handler` for asynchronous event handling.
- **Remove handlers by ID**: Store the handler ID returned on add and pass it to `remove_*_handler` during teardown.
- **Ensure Resource Cleanup**: Always wrap session execution in `begin...ensure` blocks to guarantee `driver.quit` releases BiDi sockets.
