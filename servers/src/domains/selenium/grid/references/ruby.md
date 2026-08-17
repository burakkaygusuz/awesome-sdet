# RemoteWebDriver & Enterprise Selenium Grid 4 — Ruby API Reference (Selenium 4.x+)

> Official Selenium 4 Ruby RemoteWebDriver & Grid Configuration.

---

## Code Examples

```ruby
# frozen_string_literal: true

require 'selenium-webdriver'

options = Selenium::WebDriver::Options.chrome
options.add_option('se:downloadsEnabled', true)
options.add_option('nodename:applicationName', 'node_1')

driver = Selenium::WebDriver.for(:remote, url: 'http://localhost:4444', options: options)

begin
  driver.get('https://example.com')
ensure
  driver&.quit
end
```

## Best Practices

- **Use Options Object**: Use `Selenium::WebDriver::Options.chrome` for Selenium 4 RemoteWebDriver configuration.
- **Enable Download Management**: Set `se:downloadsEnabled` option on RemoteWebDriver sessions to enable Grid file download handling.
- **Guaranteed Cleanup**: Wrap grid interaction in `begin...ensure` blocks to ensure `driver.quit` releases Grid session slots promptly on error.
