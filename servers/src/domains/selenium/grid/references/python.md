# RemoteWebDriver & Enterprise Selenium Grid 4 — Python API Reference (Selenium 4.x+)

> Official Selenium 4 RemoteWebDriver and Grid execution patterns.

---

## Code Examples

```python
from typing import Any
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def run_grid_session() -> None:
    # 1. Configure Grid Capabilities prior to session creation
    options = Options()
    options.set_capability('se:downloadsEnabled', True)
    options.set_capability("nodename:applicationName", "node_1")

    driver = webdriver.Remote(
        command_executor='http://localhost:4444',
        options=options
    )
    try:
        driver.get("https://example.com")

        # 2. Remote Download Inspection
        files: list[dict[str, Any]] = driver.get_downloadable_files()
        print("Downloaded files:", files)
    finally:
        # 3. Proper Session Release
        driver.quit()
```

## Best Practices

- **Capabilities**: Use `options.set_capability('se:downloadsEnabled', True)` instead of deprecated `DesiredCapabilities`. Configure all capabilities before instantiating `webdriver.Remote`.
- **Session Release**: Always wrap `driver.quit()` in `try ... finally` blocks or pytest fixtures to guarantee slot release on Grid nodes.
