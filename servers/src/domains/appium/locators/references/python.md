# Appium Mobile Locator Strategies — Python API Reference (Appium 3.x+)

> Official Appium 3.6.0+ Python Client `AppiumBy` locator strategies and selector expressions.

---

## 1. Selector Strategies Implementation

```python
from appium.webdriver.common.appiumby import AppiumBy
from appium.webdriver.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement


def locate_elements(driver: WebDriver) -> None:
    login_btn: WebElement = driver.find_element(
        AppiumBy.ACCESSIBILITY_ID, "login_button"
    )
    login_btn.click()

    header: WebElement = driver.find_element(
        AppiumBy.IOS_CLASS_CHAIN,
        '**/XCUIElementTypeNavigationBar/XCUIElementTypeStaticText[`label == "Home"`]',
    )
    print("Header text:", header.text)

    submit: WebElement = driver.find_element(
        AppiumBy.IOS_PREDICATE,
        'type == "XCUIElementTypeButton" AND name == "Submit" AND visible == 1',
    )
    submit.click()

    android_btn: WebElement = driver.find_element(
        AppiumBy.ANDROID_UIAUTOMATOR,
        'new UiSelector().text("Continue").className("android.widget.Button")',
    )
    android_btn.click()

    scrolled: WebElement = driver.find_element(
        AppiumBy.ANDROID_UIAUTOMATOR,
        'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("About App"))',
    )
    scrolled.click()

    input_field: WebElement = driver.find_element(
        AppiumBy.ID, "com.example.app:id/email_input"
    )
    input_field.send_keys("user@example.com")
```

---

## 2. Best Practices & Invariants

- **Always Use `AppiumBy`**: Do not use legacy `MobileBy` or Selenium `By` for mobile-specific selectors.
- **Escape Quotes in Class Chains**: Ensure internal string literals in Class Chains use proper backticks or escaped quotes.

## Image Locator

- Image-based locator for canvas UIs without semantic attributes: `AppiumBy.IMAGE, "path/to/element.png"` (requires the Appium images plugin).
