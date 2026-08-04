# WebDriver BiDi Protocol — Python API Reference (Selenium 4.46.0+)

> Official Selenium 4 Python BiDi implementation.

---

## Code Examples

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.common.bidi.console import Console

class BidiExamples:

    def demonstrate_bidi(self):
        options = ChromeOptions()
        options.enable_bidi = True

        driver = webdriver.Chrome(options=options)

        async def on_log_entry(entry):
            print(f"Log: {entry.text}")

        console = Console(driver)
        console.add_listener(Console.ALL, on_log_entry)
```

## Best Practices

- **Enable BiDi Capability**: BiDi must be explicitly enabled in ChromeOptions/FirefoxOptions before session creation (`options.enable_bidi = True`).
- **Use BiDi over CDP**: BiDi is the W3C cross-browser standard supported on Chrome, Edge, and Firefox.
- **Clean up listeners**: Detach async listeners on test teardown to prevent memory leaks in persistent browser sessions.
