# Appium Mobile Locator Strategies — Java API Reference (Appium 2.x+)

> Official Appium 2.x Java Client (`AppiumBy`, `AppiumFieldDecorator`) locator strategies and Screen Object Model.

---

## 1. Imperative Selector Strategies

```java
package com.example.sdet.appium;

import io.appium.java_client.AppiumBy;
import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.WebElement;

public class AppiumLocatorStrategies {
    public static void locateAndInteract(AppiumDriver driver) {
        WebElement loginButton = driver.findElement(AppiumBy.accessibilityId("login_button"));
        loginButton.click();

        WebElement navTitle = driver.findElement(
            AppiumBy.iOSClassChain("**/XCUIElementTypeNavigationBar/XCUIElementTypeStaticText[`label == \"Profile\"`]")
        );
        System.out.println("Title: " + navTitle.getText());

        WebElement acceptTerms = driver.findElement(
            AppiumBy.iOSNsPredicateString("type == 'XCUIElementTypeButton' AND name == 'Accept' AND visible == 1")
        );
        acceptTerms.click();

        WebElement confirmBtn = driver.findElement(
            AppiumBy.androidUIAutomator("new UiSelector().text(\"Confirm\").className(\"android.widget.Button\")")
        );
        confirmBtn.click();

        WebElement targetElement = driver.findElement(
            AppiumBy.androidUIAutomator(
                "new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text(\"Privacy Policy\"))"
            )
        );
        targetElement.click();

        WebElement inputField = driver.findElement(AppiumBy.id("com.example.app:id/edit_phone"));
        inputField.sendKeys("+15551234567");
    }
}
```

---

## 2. Screen Object Model with `AppiumFieldDecorator` (Selenium PageFactory)

```java
package com.example.sdet.appium;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.pagefactory.AndroidFindBy;
import io.appium.java_client.pagefactory.AppiumFieldDecorator;
import io.appium.java_client.pagefactory.iOSXCUITFindBy;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.PageFactory;

import java.time.Duration;

public class LoginScreen {
    private final AppiumDriver driver;

    @AndroidFindBy(accessibility = "username_input_android")
    @iOSXCUITFindBy(accessibility = "username_input_ios")
    private WebElement usernameInput;

    @AndroidFindBy(id = "com.example.app:id/password_input")
    @iOSXCUITFindBy(iOSNsPredicate = "name == 'password_field' AND visible == 1")
    private WebElement passwordInput;

    @AndroidFindBy(accessibility = "login_submit_btn")
    @iOSXCUITFindBy(iOSClassChain = "**/XCUIElementTypeButton[`label == 'Log In'`]")
    private WebElement loginButton;

    public LoginScreen(AppiumDriver driver) {
        this.driver = driver;
        PageFactory.initElements(new AppiumFieldDecorator(driver, Duration.ofSeconds(10)), this);
    }

    public void login(String username, String password) {
        usernameInput.sendKeys(username);
        passwordInput.sendKeys(password);
        loginButton.click();
    }
}
```

---

## 3. Best Practices & Invariants

- **Use `AppiumBy` Methods**: Use static helper methods (`AppiumBy.accessibilityId`, `AppiumBy.iOSClassChain`, `AppiumBy.androidUIAutomator`).
- **Encapsulate with Screen Objects**: Use `AppiumFieldDecorator` and `PageFactory.initElements` for cross-platform Screen Object encapsulation (see `selenium://pagefactory/java`).
- **Avoid Fragile XPaths**: Never use full-tree absolute XPaths which cause significant slowdowns on mobile device drivers.

## Image Locator

- Image-based locator for canvas UIs without semantic attributes: `AppiumBy.image("path/to/element.png")` (requires the Appium images plugin).
