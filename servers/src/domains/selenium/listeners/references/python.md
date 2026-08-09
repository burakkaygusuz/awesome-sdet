# Selenium Event Listeners — Python API Reference (Selenium 4.x+)

> Official Selenium 4 Python EventFiringDecorator (`selenium.webdriver.support.event_firing_webdriver.EventFiringDecorator`).

---

## Code Examples

```python
from selenium.webdriver.common.listener import AbstractEventListener
from selenium.webdriver.support.event_firing_webdriver import EventFiringDecorator
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement

class CustomListener(AbstractEventListener):

    def before_click(self, element: WebElement, driver: WebDriver) -> None:
        print(f"About to click element: {element}")

    def on_exception(self, exception: Exception, driver: WebDriver) -> None:
        print(f"Exception caught: {exception}")

class ListenerExamples:

    def demonstrate_listener(self, original_driver: WebDriver) -> WebDriver:
        # Wrap driver using Selenium 4 EventFiringDecorator
        event_driver = EventFiringDecorator(CustomListener()).decorate(original_driver)
        event_driver.get("https://example.com")
        return event_driver
```

## Best Practices

- **Use EventFiringDecorator**: Use `EventFiringDecorator` in Selenium 4+ instead of the deprecated `EventFiringWebDriver`.
- **Thread Safety**: Ensure listener hooks (`before_click`, `on_exception`) are thread-safe when running tests in parallel.
- **Non-blocking Operations**: Avoid long-running network or disk operations inside listener callbacks.
