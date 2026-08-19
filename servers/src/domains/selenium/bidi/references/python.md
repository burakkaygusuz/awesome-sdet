# WebDriver BiDi Protocol — Python API Reference (Selenium 4.x+)

> Official Selenium 4 Python WebDriver BiDi (`driver.script` · `driver.network`).

---

## Enabling BiDi

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

options = Options()
options.enable_bidi = True
driver = webdriver.Chrome(options=options)
```

---

## Code Examples

```python
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.wait import WebDriverWait


def demonstrate_bidi() -> None:
    options = Options()
    options.enable_bidi = True

    driver = webdriver.Chrome(options=options)
    try:
        log_entries: list = []
        handler_id = driver.script.add_console_message_handler(log_entries.append)

        driver.get("https://www.selenium.dev/selenium/web/bidi/logEntryAdded.html")
        driver.find_element(By.ID, "consoleLog").click()
        WebDriverWait(driver, 5).until(lambda _: log_entries)

        driver.script.remove_console_message_handler(handler_id)
    finally:
        driver.quit()


def demonstrate_network_intercept() -> None:
    options = Options()
    options.enable_bidi = True

    driver = webdriver.Chrome(options=options)
    try:
        requests = []

        def on_before_request(request):
            requests.append(request)

        callback_id = driver.network.add_request_handler("before_request", on_before_request)
        driver.get("https://www.selenium.dev/selenium/web/blank.html")
        driver.network.remove_request_handler("before_request", callback_id)
    finally:
        driver.quit()
```

## Best Practices

- **Enable BiDi in options**: Set `options.enable_bidi = True` before session creation.
- **Use high-level namespaces**: Prefer `driver.script.add_console_message_handler()` and `driver.network.add_request_handler()` over legacy log polling.
- **Remove handlers by ID**: Store the handler ID returned on add and pass it to `remove_*_handler()` during teardown.
- **Clean Teardown**: Always wrap session execution in `try ... finally: driver.quit()` to prevent lingering browser processes.
