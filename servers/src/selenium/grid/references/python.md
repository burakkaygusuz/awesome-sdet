# RemoteWebDriver & Enterprise Selenium Grid 4 — Python API Reference

## Code Examples

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

# 1. Basic RemoteWebDriver & Download Capability
options = Options()
options.set_capability('se:downloadsEnabled', True)

driver = webdriver.Remote(
    command_executor='http://localhost:4444',
    options=options
)

# 2. Remote Download Inspection
files = driver.get_downloadable_files()

# 3. Custom Grid Node Stereotypes
options.set_capability("nodename:applicationName", "node_1")
driver.get("https://example.com")
driver.quit()
```

## Best Practices

- **Capabilities**: Use `options.set_capability('se:downloadsEnabled', True)` instead of deprecated `DesiredCapabilities`.
- **Session Release**: Wrap `driver.quit()` in try/finally blocks or context managers.
