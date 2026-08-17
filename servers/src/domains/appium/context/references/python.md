# Appium Hybrid Context Switching — Python API Reference (Appium 2.x+)

> Official Appium 2.x Python Client context inspection and WebView switching.

---

## 1. Context Discovery & Switching Flow

```python
from appium.webdriver.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait


def switch_to_webview(driver: WebDriver) -> None:
    contexts: list[str] = driver.contexts
    print("Available contexts:", contexts)

    webview_context: str | None = next(
        (c for c in contexts if "WEBVIEW" in c), None
    )
    if webview_context:
        driver.switch_to.context(webview_context)
        try:
            print("Active context:", driver.current_context)

            wait = WebDriverWait(driver, 10)
            element: WebElement = wait.until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button.pay-now"))
            )
            element.click()
        finally:
            driver.switch_to.context("NATIVE_APP")
            print("Switched back to:", driver.current_context)
    else:
        raise RuntimeError("No WebView context available")
```

---

## 2. Best Practices & Invariants

- **Use `driver.switch_to.context()`**: Standard W3C context switching command in Python Client 4.x+.
- **Clean Context Restorations**: Always restore `"NATIVE_APP"` before performing native gestures.
- **Selenium Interoperability**: `AppiumDriver` inherits from Selenium `WebDriver`; standard Selenium `By.CSS_SELECTOR` and `WebDriverWait` apply inside WebViews (see `selenium://locators/python`).
