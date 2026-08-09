# WebDriver BiDi Protocol — Python API Reference (Selenium 4.x+)

> Official Selenium 4 Python BiDi implementation (`web_socket_url` and `LogInspector`).

---

## Code Examples

```python
from typing import Any
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.log import LogInspector

class BidiExamples:

    async def demonstrate_bidi(self) -> None:
        options = ChromeOptions()
        options.web_socket_url = True

        driver = webdriver.Chrome(options=options)
        try:
            async def on_log_entry(entry: Any) -> None:
                print(f"Log: {entry.text}")

            log_inspector = LogInspector(driver)
            await log_inspector.on_console_entry(on_log_entry)
            driver.get("https://example.com")
        finally:
            driver.quit()
```

## Best Practices

- **Enable BiDi Capability**: Enable WebSocket W3C BiDi in options prior to session initialization (`options.web_socket_url = True`).
- **Use BiDi over CDP**: BiDi is the W3C cross-browser standard supported on Chrome, Edge, and Firefox.
- **Clean Teardown**: Always wrap session execution in `try ... finally: driver.quit()` to prevent lingering browser processes.
