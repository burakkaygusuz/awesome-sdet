# Selenium Event Listeners — Python API Reference (Selenium 4.46.0+)

> Official Selenium 4 Python EventFiringWebDriver (`selenium.webdriver.support.abstract_event_listener.AbstractEventListener`).

---

## Code Examples

```python
from selenium.webdriver.support.abstract_event_listener import AbstractEventListener
from selenium.webdriver.support.event_firing_webdriver import EventFiringWebDriver
from selenium.webdriver.remote.webdriver import WebDriver

class CustomListener(AbstractEventListener):

    def before_click(self, element, driver):
        print(f"About to click element: {element}")

    def on_exception(self, exception, driver):
        print(f"Exception caught: {exception}")

class ListenerExamples:

    def demonstrate_listener(self, original_driver: WebDriver):
        # Wrap driver with EventFiringWebDriver
        event_driver = EventFiringWebDriver(original_driver, CustomListener())
        event_driver.get("https://example.com")
```

## Best Practices

- **Thread Safety**: Ensure listener hooks (`before_click`, `on_exception`) are thread-safe when running tests in parallel.
- **Non-blocking Operations**: Avoid long-running network or disk operations inside listener callbacks.
- **Inherit from AbstractEventListener**: Extend `AbstractEventListener` so you only override the specific hooks you need.
