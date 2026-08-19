# Selenium Event Listeners — Python API Reference (Selenium 4.x+)

> Official Selenium 4 Python EventFiringWebDriver (`selenium.webdriver.support.event_firing_webdriver.EventFiringWebDriver`).

---

## Code Examples

```python
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.abstract_event_listener import (
    AbstractEventListener,
)
from selenium.webdriver.support.event_firing_webdriver import (
    EventFiringWebDriver,
)


class CustomListener(AbstractEventListener):

    def before_click(self, element: WebElement, driver: WebDriver) -> None:
        print(f"About to click element: {element}")

    def on_exception(self, exception: Exception, driver: WebDriver) -> None:
        print(f"Exception caught: {exception}")


class ListenerExamples:

    def demonstrate_listener(self, original_driver: WebDriver) -> WebDriver:
        event_driver = EventFiringWebDriver(original_driver, CustomListener())
        event_driver.get("https://example.com")
        return event_driver
```

## Best Practices

- **Wrap Target Driver**: Wrap `original_driver` with `EventFiringWebDriver(original_driver, listener)` prior to test execution.
- **BiDi for Protocol Events**: For network or console logs, prefer WebDriver BiDi (`driver.script` · `driver.network`) over legacy event listeners.
- **Thread Safety**: Ensure listener hooks (`before_click`, `on_exception`) are thread-safe when running tests in parallel.
- **Non-blocking Operations**: Avoid long-running network or disk operations inside listener callbacks.
