# Appium Device & Application Management — Python API Reference (Appium 3.x+)

> Official Appium 3.6.0+ Python Client application lifecycle operations, system clipboard, and device state controls.

---

## 1. Application Lifecycle & Device Controls

```python
from appium.webdriver.webdriver import WebDriver

def manage_device_and_app(driver: WebDriver) -> None:
    package_name = "com.example.app"

    # 1. App Lifecycle
    if not driver.is_app_installed(package_name):
        driver.install_app("/path/to/app.apk")

    driver.activate_app(package_name)

    # Background app for 5 seconds
    driver.background_app(5)

    # Check App state
    state = driver.query_app_state(package_name)
    print("Application state:", state)

    # 2. Clipboard Management
    driver.set_clipboard_text("one-time-password-9988")
    otp = driver.get_clipboard_text()
    print("OTP from clipboard:", otp)

    # 3. Orientation & Keyboard
    if driver.is_keyboard_shown():
        driver.hide_keyboard()

    driver.orientation = "PORTRAIT"

    # 4. Terminate App
    driver.terminate_app(package_name)
```

---

## 2. Best Practices & Invariants

- **Always Check Keyboard State**: Query `is_keyboard_shown()` before invoking `hide_keyboard()`.
- **Clean Clipboard**: Overwrite sensitive clipboard values after test verification.
