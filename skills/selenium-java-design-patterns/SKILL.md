---
name: selenium-java-design-patterns
description: Use for implementing official Selenium 4 Java design patterns and strategies — LoadableComponent (`LoadableComponent`, `SlowLoadableComponent`), Page Component Objects (nested component POM), Action Bot pattern, and fluent user journey modeling. Trigger on design patterns, LoadableComponent, ActionBot, component objects, page object architecture, or structuring maintainable test suites.
metadata:
  keywords:
    [
      'selenium',
      'java',
      'design-patterns',
      'loadable-component',
      'action-bot',
      'page-components',
      'testing',
    ]
---

# Design Patterns & Strategies — Selenium Java

## Source & scope

Condensed from official Selenium documentation (`selenium.dev/documentation/test_practices/design_strategies/`). Covers foundational design patterns for building maintainable, robust Selenium Java test automation suites: **LoadableComponent**, **Page Component Objects**, **Action Bot**, and **Fluent User Journey Modeling**. Code examples use Selenium 4 and JUnit 5 (`org.junit.jupiter.api.Assertions`).

---

## 1. LoadableComponent Pattern

`LoadableComponent<T>` standardizes three things: triggering loading (`load()`), verifying loaded state (`isLoaded()`), and a single idempotent entry point (`get()`) that checks first and loads only if necessary.

### Core API

| Member                                            | Description                                                                                                   |
| :------------------------------------------------ | :------------------------------------------------------------------------------------------------------------ |
| `T get()`                                         | Checks `isLoaded()`; if it fails (throws `Error`), calls `load()` then `isLoaded()` again. Returns `this`.    |
| `protected abstract void load()`                  | Side-effect-only navigation (`driver.get(url)` or parent `get()`). Do not assert here.                        |
| `protected abstract void isLoaded() throws Error` | Assert loaded state. Return normally on success; **throw `Error`** (e.g. `Assertions.assertTrue`) on failure. |

### Recipe 1.1 — Basic LoadableComponent

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.support.ui.LoadableComponent;
import org.junit.jupiter.api.Assertions;

public class EditIssuePage extends LoadableComponent<EditIssuePage> {
  private final WebDriver driver;

  public EditIssuePage(WebDriver driver) {
    this.driver = driver;
  }

  @Override
  protected void load() {
    driver.get("https://github.com/SeleniumHQ/selenium/issues/new");
  }

  @Override
  protected void isLoaded() throws Error {
    String url = driver.getCurrentUrl();
    Assertions.assertTrue(url.contains("/issues/new"), "Not on edit issue page: " + url);
  }
}
```

Usage in tests: Always invoke `.get()`:

```java
EditIssuePage page = new EditIssuePage(driver).get();
```

### Recipe 1.2 — SlowLoadableComponent (Asynchronous Loading)

Use `SlowLoadableComponent<T>` when page rendering or data fetching is asynchronous (XHR/AJAX). `get()` polls `isLoaded()` until timeout elapses.

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.SlowLoadableComponent;
import java.time.Clock;
import java.time.Duration;
import org.junit.jupiter.api.Assertions;

public class SearchResultsPage extends SlowLoadableComponent<SearchResultsPage> {
  private final WebDriver driver;

  public SearchResultsPage(WebDriver driver) {
    super(Clock.systemDefaultZone(), Duration.ofSeconds(10));
    this.driver = driver;
  }

  @Override
  protected void load() {
    driver.findElement(By.id("search-btn")).click();
  }

  @Override
  protected void isLoaded() throws Error {
    Assertions.assertFalse(
      driver.findElements(By.cssSelector(".result-item")).isEmpty(),
      "Search results have not rendered yet"
    );
  }

  @Override
  protected void isError() throws Error {
    Assertions.assertTrue(
      driver.findElements(By.cssSelector(".error-banner")).isEmpty(),
      "Search failed with error banner"
    );
  }
}
```

---

## 2. Page Component Objects Pattern

Instead of creating monolithic Page Objects representing an entire HTML document, model reusable sub-elements (Navbar, Footer, Modals, Tables) as **Page Components**. Components can be embedded within full Page Objects or other components.

### Recipe 2.1 — Embedded Component (Navigation Bar)

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.By;

public class NavigationBarComponent {
  private final WebDriver driver;
  private final By userProfileLocator = By.cssSelector("[data-testid='user-profile']");
  private final By logoutButtonLocator = By.id("logout-btn");

  public NavigationBarComponent(WebDriver driver) {
    this.driver = driver;
  }

  public String getLoggedInUsername() {
    return driver.findElement(userProfileLocator).getText();
  }

  public LoginPage logout() {
    driver.findElement(logoutButtonLocator).click();
    return new LoginPage(driver);
  }
}

public class DashboardPage {
  private final WebDriver driver;
  private final NavigationBarComponent navBar;

  public DashboardPage(WebDriver driver) {
    this.driver = driver;
    this.navBar = new NavigationBarComponent(driver);
  }

  public NavigationBarComponent navBar() {
    return navBar;
  }
}
```

---

## 3. Action Bot Pattern

The **Action Bot** encapsulates low-level WebDriver interactions (`click`, `type`, `clear`, `selectOption`) with built-in explicit waits and error handling. Page Objects delegate user actions to the Action Bot instead of directly invoking raw `driver.findElement(...)` calls.

### Recipe 3.1 — Action Bot Implementation

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.openqa.selenium.support.ui.ExpectedConditions;
import java.time.Duration;

public class ActionBot {
  private final WebDriver driver;
  private final Duration timeout;

  public ActionBot(WebDriver driver, Duration timeout) {
    this.driver = driver;
    this.timeout = timeout;
  }

  public void click(By locator) {
    WebDriverWait wait = new WebDriverWait(driver, timeout);
    WebElement element = wait.until(ExpectedConditions.elementToBeClickable(locator));
    element.click();
  }

  public void type(By locator, String text) {
    WebDriverWait wait = new WebDriverWait(driver, timeout);
    WebElement element = wait.until(ExpectedConditions.visibilityOfElementLocated(locator));
    element.clear();
    element.sendKeys(text);
  }

  public String getText(By locator) {
    WebDriverWait wait = new WebDriverWait(driver, timeout);
    return wait.until(ExpectedConditions.visibilityOfElementLocated(locator)).getText();
  }
}
```

Usage within Page Objects:

```java
public class LoginPage {
  private final ActionBot bot;
  private final By usernameInput = By.id("username");
  private final By passwordInput = By.id("password");
  private final By submitButton = By.id("submit");

  public LoginPage(WebDriver driver) {
    this.bot = new ActionBot(driver, Duration.ofSeconds(10));
  }

  public DashboardPage login(String username, String password) {
    bot.type(usernameInput, username);
    bot.type(passwordInput, password);
    bot.click(submitButton);
    return new DashboardPage(bot.getDriver());
  }
}
```

---

## 4. Fluent User Journey Modeling

Page Object methods representing user actions should return the next logical Page Object, Page Component, or `this` (for operations staying on the same page). This enables fluent method chaining that models end-to-end user journeys.

```java
@Test
void userCanCompleteCheckoutJourney() {
  new HomePage(driver).get()
    .searchFor("Selenium Handbook")
    .selectFirstResult()
    .addToCart()
    .proceedToCheckout()
    .enterShippingDetails("John Doe", "123 Main St")
    .placeOrder();
}
```

---

## Best Practices & Anti-Patterns

- **No Assertions in Page Objects**: Page Objects and Action Bots should expose capabilities, not assertions. Assertions belong in test methods or `LoadableComponent.isLoaded()`.
- **Throw `Error` in `isLoaded()`**: `LoadableComponent.isLoaded()` MUST throw `Error` (or JUnit `AssertionError`) on failure so `get()` retry logic functions correctly.
- **Prefer Composition over Inheritance**: Use Page Components and Action Bots via composition inside Page Objects rather than creating deep inheritance hierarchies.

---

## Dynamic MCP Support & Reference (Optional)

This skill is fully self-contained. If the `sdet-mcp` server is available in your workspace, you can dynamically query multi-language code references and Javadoc specifications for `LoadableComponent` via the `read_se_pagefactory_docs` tool.
