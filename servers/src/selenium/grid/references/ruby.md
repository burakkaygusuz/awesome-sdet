# RemoteWebDriver & Enterprise Selenium Grid 4 — Ruby API Reference

## Code Examples

```ruby
require 'selenium-webdriver'

# 1. RemoteWebDriver Setup with Capabilities
options = Selenium::WebDriver::Options.chrome
options.add_option('se:downloadsEnabled', true)

driver = Selenium::WebDriver.for(:remote, url: 'http://localhost:4444', options: options)

# 2. Node Stereotype Capabilities
options.add_option('nodename:applicationName', 'node_1')

driver.get('https://example.com')
driver.quit
```

## Best Practices

- **Use Options Object**: Use `Selenium::WebDriver::Options.chrome` for Selenium 4 RemoteWebDriver configuration.
- **Ensure Quit**: Always invoke `driver.quit` at test completion.
