# Page Object Model (POM) — Python API Reference (Selenium 4.x+)

> Official Selenium WebDriver Python Binding (`selenium.webdriver.common.by.By`) Page Object Patterns.

---

## Code Examples

```python
from typing import Self
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

class LoginPage:
    """Page Object representing the Login Page in Python Selenium."""

    USERNAME_INPUT: tuple[str, str] = (By.ID, "username")
    PASSWORD_INPUT: tuple[str, str] = (By.ID, "password")
    LOGIN_BUTTON: tuple[str, str] = (By.CSS_SELECTOR, "button[type='submit']")

    def __init__(self, driver: WebDriver, timeout: float = 10.0) -> None:
        self.driver = driver
        self.wait = WebDriverWait(driver, timeout)

    def enter_username(self, username: str) -> Self:
        element = self.wait.until(EC.visibility_of_element_located(self.USERNAME_INPUT))
        element.clear()
        element.send_keys(username)
        return self

    def enter_password(self, password: str) -> Self:
        element = self.wait.until(EC.visibility_of_element_located(self.PASSWORD_INPUT))
        element.clear()
        element.send_keys(password)
        return self

    def click_login(self) -> None:
        button = self.wait.until(EC.element_to_be_clickable(self.LOGIN_BUTTON))
        button.click()

    def login(self, username: str, password: str) -> None:
        self.enter_username(username)
        self.enter_password(password)
        self.click_login()
```

---

## Best Practices

1. **Tuple Locators**: Store locators as `(By.<STRATEGY>, "selector_value")` class constants with explicit type annotations (`tuple[str, str]`).
2. **Unpacking**: Unpack locators into `driver.find_element(*self.LOCATOR)`.
3. **Fluent Methods**: Return `self` (`typing.Self`) from input methods to allow method chaining.
4. **Explicit Waits**: Integrate `WebDriverWait` directly into Page Object methods rather than implicit waits.
