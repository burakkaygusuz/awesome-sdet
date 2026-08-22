# Page Object Model (POM) — Java API Reference (Selenium 4.x+)

> Official Selenium PageFactory support library (`org.openqa.selenium.support` & `org.openqa.selenium.support.pagefactory`) updated for Selenium 4 (4.46.0+).

---

## Code Examples

```java
package com.example.pages;

import static org.openqa.selenium.support.ui.ExpectedConditions.elementToBeClickable;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;

import java.time.Duration;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    @FindBy(id = "username")
    private WebElement usernameInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    @FindBy(css = "button[type='submit']")
    private WebElement loginButton;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        PageFactory.initElements(driver, this);
    }

    public void login(String username, String password) {
        wait.until(visibilityOf(usernameInput)).sendKeys(username);
        wait.until(visibilityOf(passwordInput)).sendKeys(password);
        wait.until(elementToBeClickable(loginButton)).click();
    }
}
```

---

## Best Practices

1. **PageFactory.initElements**: Initialize annotated `@FindBy` elements in the constructor with `PageFactory.initElements(driver, this)`.
2. **Explicit Waits with PageFactory**: Prefer wrapping element interactions in `WebDriverWait.until(visibilityOf(...))` or `elementToBeClickable(...)`.
3. **Private WebElement Fields**: Encapsulate locators as `private WebElement` fields with descriptive names.
4. **Duration API**: Selenium 4 Java bindings require `java.time.Duration.ofSeconds(...)` instead of legacy integer seconds.
