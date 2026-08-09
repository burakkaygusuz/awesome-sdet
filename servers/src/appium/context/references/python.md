# Appium Hybrid Context Switching — Python API Reference (Appium 3.x+)

> Official Appium 3.6.0+ Python Client context inspection and WebView switching.

---

## 1. Context Discovery & Switching Flow

```python
from appium.webdriver.webdriver import WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def switch_to_webview(driver: WebDriver) -> None:
    contexts = driver.contexts
    print("Available contexts:", contexts)

    webview_context = next((c for c in contexts if "WEBVIEW" in c), None)
    if webview_context:
        driver.switch_to.context(webview_context)
        print("Active context:", driver.current_context)

        # Standard Selenium By and WebDriverWait inside webview
        wait = WebDriverWait(driver, 10)
        element = wait.until(EC.element_to_be_clickable((By.CSS_SELECTOR, "button.pay-now")))
        element.click()

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
