# Appium W3C Actions API & Mobile Gestures — Python API Reference (Appium 3.x+)

> Official Appium 3.6.0+ Python Client W3C ActionChains, PointerInput touch sequences, and mobile execute scripts.

---

## 1. W3C ActionChains Touch Pointer Gestures

```python
from appium.webdriver.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.common.actions import interaction
from selenium.webdriver.common.actions.action_builder import ActionBuilder
from selenium.webdriver.common.actions.pointer_input import PointerInput

def swipe_vertical(
    driver: WebDriver,
    start_x: int,
    start_y: int,
    end_x: int,
    end_y: int,
    duration_ms: int = 500
) -> None:
    """Performs vertical swipe using standard W3C ActionChains with touch pointer."""
    actions = ActionChains(driver)
    touch_input = PointerInput(interaction.POINTER_TOUCH, "touch")
    actions.w3c_actions = ActionBuilder(driver, mouse=touch_input)

    actions.w3c_actions.pointer_action.move_to_location(start_x, start_y)
    actions.w3c_actions.pointer_action.pointer_down()
    actions.w3c_actions.pointer_action.pause(0.1)
    actions.w3c_actions.pointer_action.move_to_location(end_x, end_y)
    actions.w3c_actions.pointer_action.release()
    actions.perform()

def tap_element(driver: WebDriver, element: WebElement) -> None:
    """Tap element center using ActionChains."""
    actions = ActionChains(driver)
    actions.click(element).perform()
```

---

## 2. Platform-Specific Mobile Execute Scripts

```python
def execute_mobile_scroll_android(driver: WebDriver, element_id: str) -> None:
    """Platform-specific execute command for Android UiAutomator2."""
    driver.execute_script("mobile: scrollGesture", {
        "elementId": element_id,
        "direction": "down",
        "percent": 0.75
    })

def execute_mobile_pinch_ios(driver: WebDriver, scale: float = 0.5, velocity: float = -1.0) -> None:
    """Platform-specific execute command for iOS XCUITest pinch."""
    driver.execute_script("mobile: pinch", {
        "scale": scale,
        "velocity": velocity
    })
```

---

## 3. Best Practices & Invariants

- **Standard W3C Actions**: Do not import `TouchAction` from `appium.webdriver.common.touch_action`.
- **Duration Tuning**: Keep swipe duration between 400ms and 800ms to avoid unintentional flings.
