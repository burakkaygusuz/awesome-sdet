# Appium Driver Architecture & W3C Capabilities — Python API Reference (Appium 3.6.0+)

> Official Appium 3.6.0+ Python Client options classes, W3C capability negotiation, and remote driver management.

---

## 1. Android Driver Setup (UiAutomator2Options)

```python
from appium import webdriver
from appium.options.android import UiAutomator2Options

def create_android_driver() -> webdriver.Remote:
    options = UiAutomator2Options()
    options.platform_name = "Android"
    options.automation_name = "UiAutomator2"
    options.device_name = "Pixel_7_API_34"
    options.app = "/path/to/app-release.apk"
    options.app_package = "com.example.app"
    options.app_activity = "com.example.app.MainActivity"
    options.no_reset = False
    options.auto_grant_permissions = True

    return webdriver.Remote(
        command_executor="http://127.0.0.1:4723",
        options=options
    )
```

---

## 2. iOS Driver Setup (XCUITestOptions)

```python
from appium import webdriver
from appium.options.ios import XCUITestOptions

def create_ios_driver() -> webdriver.Remote:
    options = XCUITestOptions()
    options.platform_name = "iOS"
    options.automation_name = "XCUITest"
    options.platform_version = "17.2"
    options.device_name = "iPhone 15 Pro"
    options.bundle_id = "com.example.sampleapp"
    options.no_reset = True
    options.wda_local_port = 8100

    return webdriver.Remote(
        command_executor="http://127.0.0.1:4723",
        options=options
    )
```

---

## 3. Best Practices & Invariants

- **Dedicated Options Classes**: Use `UiAutomator2Options` and `XCUITestOptions` rather than untyped raw dictionaries.
- **Proper Teardown**: Always call `driver.quit()` in `try ... finally` or pytest fixtures with yield.
- **Timeout Configuration**: Set `options.new_command_timeout = 300` for long-running test suites.
