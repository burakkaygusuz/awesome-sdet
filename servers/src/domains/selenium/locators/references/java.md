# Selenium Locator Strategies — Java API Reference (Selenium 4.x+)

> Official Selenium 4 Java locator strategies (`org.openqa.selenium.By` & `org.openqa.selenium.support.locators.RelativeLocator`).

---

## Code Examples

```java
package com.example.locators;

import static org.openqa.selenium.By.className;
import static org.openqa.selenium.By.cssSelector;
import static org.openqa.selenium.By.id;
import static org.openqa.selenium.By.name;
import static org.openqa.selenium.By.tagName;
import static org.openqa.selenium.By.xpath;
import static org.openqa.selenium.support.locators.RelativeLocator.with;

import java.util.List;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;

public class LocatorExamples {

    public void demonstrateLocators(WebDriver driver) {
        WebElement username = driver.findElement(id("username"));
        WebElement submitBtn = driver.findElement(cssSelector("button.btn-success[type='submit']"));
        WebElement emailInput = driver.findElement(name("email"));
        List<WebElement> cardItems = driver.findElements(className("card-item"));
        WebElement dynamicCell = driver.findElement(xpath("//tr[td[text()='Active']]//button"));

        // Selenium 4 Relative Locators (spatial queries: below, toLeftOf)
        WebElement passwordInput = driver.findElement(with(tagName("input")).below(username));
        passwordInput.sendKeys("secret123");

        WebElement cancelButton = driver.findElement(with(tagName("button")).toLeftOf(submitBtn));
        cancelButton.click();
    }
}
```

## Shadow DOM Piercing

Selenium 4 exposes open shadow roots via `getShadowRoot()`; query inside them with standard locators:

```java
WebElement shadowHost = driver.findElement(By.cssSelector("my-card"));
SearchContext shadowRoot = shadowHost.getShadowRoot();
WebElement inner = shadowRoot.findElement(By.cssSelector("p"));
SearchContext nestedRoot = shadowRoot.findElement(By.cssSelector("child-widget")).getShadowRoot();
```

## Link Text Strategies

Anchor-only strategies: `By.linkText("Sign in")` / `By.partialLinkText("Sign")`.
