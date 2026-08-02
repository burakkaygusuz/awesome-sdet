# Selenium Locator Strategies — Python API Reference (Python 3.10+ & Selenium 4.46.0+)

> Official Selenium 4 Python locator strategies (`selenium.webdriver.common.by.By` & `selenium.webdriver.support.relative_locator.locate_with`).

---

## Python Code Examples (Selenium 4)

```python
from selenium.webdriver.common.by import By
from selenium.webdriver.support.relative_locator import locate_with
from selenium.webdriver.remote.webdriver import WebDriver

class LocatorExamples:

    # Tuple locators (Python Best Practice)
    USERNAME_INPUT = (By.ID, "username")
    SUBMIT_BUTTON = (By.CSS_SELECTOR, "button.btn-success[type='submit']")
    EMAIL_INPUT = (By.NAME, "email")
    ROW_BUTTON = (By.XPATH, "//tr[td[text()='Active']]//button")

    def demonstrate_locators(self, driver: WebDriver):
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
