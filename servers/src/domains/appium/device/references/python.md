# Appium Device & Application Management — Python API Reference (Appium 3.x+)

> Official Appium 3.6.0+ Python Client application lifecycle operations, system clipboard, and device state controls.

---

## 1. Application Lifecycle & Device Controls

```python
from pathlib import Path
from typing import Any
from appium.webdriver.webdriver import WebDriver


def manage_device_and_app(driver: WebDriver) -> None:
    package_name = "com.example.app"
    app_path = Path("/path/to/app.apk")

    if not driver.is_app_installed(package_name):
        driver.install_app(str(app_path))

    driver.activate_app(package_name)
    driver.background_app(5)

    state: int = driver.query_app_state(package_name)
    print("Application state:", state)

    driver.set_clipboard_text("one-time-password-9988")
    otp: str = driver.get_clipboard_text()
    print("OTP from clipboard:", otp)

    if driver.is_keyboard_shown():
        driver.hide_keyboard()

    driver.orientation = "PORTRAIT"
    driver.terminate_app(package_name)
```

---

## 2. Best Practices & Invariants

- **Always Check Keyboard State**: Query `is_keyboard_shown()` before invoking `hide_keyboard()`.
- **Clean Clipboard**: Overwrite sensitive clipboard values after test verification.
