# Appium Mobile Locator Strategies — Python API Reference (Appium 3.6.0+)

> Official Appium 3.6.0+ Python Client `AppiumBy` locator strategies and selector expressions.

---

## 1. Selector Strategies Implementation

```python
from appium.webdriver.common.appiumby import AppiumBy
from appium.webdriver.webdriver import WebDriver

def locate_elements(driver: WebDriver) -> None:
    # 1. Accessibility ID (Cross-Platform Gold Standard)
    login_btn = driver.find_element(AppiumBy.ACCESSIBILITY_ID, "login_button")
    login_btn.click()

    # 2. iOS Class Chain
    header = driver.find_element(
        AppiumBy.IOS_CLASS_CHAIN,
        '**/XCUIElementTypeNavigationBar/XCUIElementTypeStaticText[`label == "Home"`]'
    )
    print("Header text:", header.text)

    # 3. iOS Predicate String
    submit = driver.find_element(
        AppiumBy.IOS_PREDICATE,
        'type == "XCUIElementTypeButton" AND name == "Submit" AND visible == 1'
    )
    submit.click()

    # 4. Android UiAutomator
    android_btn = driver.find_element(
        AppiumBy.ANDROID_UIAUTOMATOR,
        'new UiSelector().text("Continue").className("android.widget.Button")'
    )
    android_btn.click()

    # 5. Android UiScrollable (Dynamic scroll into view)
    scrolled = driver.find_element(
        AppiumBy.ANDROID_UIAUTOMATOR,
        'new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text("About App"))'
    )
    scrolled.click()

    # 6. Resource ID
    input_field = driver.find_element(AppiumBy.ID, "com.example.app:id/email_input")
    input_field.send_keys("user@example.com")
```

---

## 2. Best Practices & Invariants

- **Always Use `AppiumBy`**: Do not use legacy `MobileBy` or Selenium `By` for mobile-specific selectors.
- **Escape Quotes in Class Chains**: Ensure internal string literals in Class Chains use proper backticks or escaped quotes.
