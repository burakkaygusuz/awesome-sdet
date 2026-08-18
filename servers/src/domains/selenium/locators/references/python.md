# Selenium Locator Strategies — Python API Reference (Selenium 4.x+)

> Official Selenium 4 Python locator strategies (`selenium.webdriver.common.by.By` & `selenium.webdriver.support.relative_locator.locate_with`).

---

## Code Examples

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.support.relative_locator import locate_with


class LocatorExamples:

    USERNAME_INPUT: tuple[str, str] = (By.ID, "username")
    SUBMIT_BUTTON: tuple[str, str] = (
        By.CSS_SELECTOR,
        "button.btn-success[type='submit']",
    )
    EMAIL_INPUT: tuple[str, str] = (By.NAME, "email")
    ROW_BUTTON: tuple[str, str] = (By.XPATH, "//tr[td[text()='Active']]//button")

    def demonstrate_locators(self, driver: WebDriver) -> None:
        username: WebElement = driver.find_element(*self.USERNAME_INPUT)
        submit_btn: WebElement = driver.find_element(*self.SUBMIT_BUTTON)

        password_input: WebElement = driver.find_element(
            locate_with(By.TAG_NAME, "input").below(username)
        )
        password_input.send_keys("secret123")

        cancel_button: WebElement = driver.find_element(
            locate_with(By.TAG_NAME, "button").to_left_of(submit_btn)
        )
        cancel_button.click()
```

---

## Best Practices

- **Tuple Unpacking**: Define locators as `(By.<STRATEGY>, "selector")` tuples and unpack them with `*` when calling `find_element`.
- **Relative Locators**: Prefer spatial relative locators (`below`, `above`, `to_left_of`, `to_right_of`, `near`) for dynamic forms where IDs change.

## Shadow DOM Piercing

Selenium 4 exposes open shadow roots via `.shadow_root`; query inside them with standard locators:

```python
shadow_host = driver.find_element(By.CSS_SELECTOR, "my-card")
shadow_root = shadow_host.shadow_root
inner = shadow_root.find_element(By.CSS_SELECTOR, "p")
nested_root = shadow_root.find_element(By.CSS_SELECTOR, "child-widget").shadow_root
```

## Link Text Strategies

Anchor-only strategies: `By.LINK_TEXT` / `By.PARTIAL_LINK_TEXT`.
