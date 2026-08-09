# Selenium Locator Strategies — Python API Reference (Selenium 4.x+)

> Official Selenium 4 Python locator strategies (`selenium.webdriver.common.by.By` & `selenium.webdriver.support.relative_locator.locate_with`).

---

## Code Examples

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.support.relative_locator import locate_with
from selenium.webdriver.remote.webdriver import WebDriver

class LocatorExamples:

    # Tuple locators (Python Best Practice)
    USERNAME_INPUT: tuple[str, str] = (By.ID, "username")
    SUBMIT_BUTTON: tuple[str, str] = (By.CSS_SELECTOR, "button.btn-success[type='submit']")
    EMAIL_INPUT: tuple[str, str] = (By.NAME, "email")
    ROW_BUTTON: tuple[str, str] = (By.XPATH, "//tr[td[text()='Active']]//button")

    def demonstrate_locators(self, driver: WebDriver) -> None:
        # 1. Unpacking Tuple Locators
        username = driver.find_element(*self.USERNAME_INPUT)
        submit_btn = driver.find_element(*self.SUBMIT_BUTTON)

        # 2. Selenium 4 Relative Locators (Spatial)
        password_input = driver.find_element(
            locate_with(By.TAG_NAME, "input").below(username)
        )
        cancel_button = driver.find_element(
            locate_with(By.TAG_NAME, "button").left_of(submit_btn)
        )
```

---

## Best Practices

- **Tuple Unpacking**: Define locators as `(By.<STRATEGY>, "selector")` tuples and unpack them with `*` when calling `find_element`.
- **Relative Locators**: Prefer spatial relative locators (`below`, `above`, `left_of`, `right_of`, `near`) for dynamic forms where IDs change.
