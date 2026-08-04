---
name: selenium-java-cookies-storage
description: Reference and implementation guide for Selenium 4 Cookie management, login UI auth bypass via session/cookie injection, and HTML5 LocalStorage/SessionStorage state handling via JavascriptExecutor. Trigger on Cookie, addCookie, getCookieNamed, deleteAllCookies, auth bypass, session injection, LocalStorage, or SessionStorage in Selenium Java.
metadata:
  keywords: ['selenium', 'java', 'cookie', 'auth-bypass', 'storage', 'session', 'testing']
---

# Cookie & Session Storage Management — Selenium Java

## Source & scope

Condensed from official Selenium documentation (`selenium.dev/documentation/webdriver/interactions/cookies/`). Explains how to manage HTTP cookies, perform UI login auth bypass via token/session injection, and access browser storage in Selenium 4 (4.46.0+). Code examples use Java 17+ and JUnit 5 (`org.junit.jupiter.api.Assertions`).

## Core concepts

Selenium `Options` interface exposes `driver.manage()` for managing cookies. Injecting valid session cookies or auth tokens bypasses slow login UI forms and speeds up test suite execution.

```java
// Navigate to target domain first (mandatory per W3C spec before setting cookies)
driver.get("https://example.com");

driver.manage().addCookie(new Cookie("session_id", "xyz123authsecret"));
driver.navigate().refresh();
```

## Recipes

### Recipe 1 — Authentication Bypass via Session Cookie Injection

```java
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.junit.jupiter.api.Assertions;

WebDriver driver = new ChromeDriver();

// Step 1: Open domain to establish origin context
driver.get("https://example.com/404");

// Step 2: Inject pre-authenticated session cookie
Cookie authCookie = new Cookie.Builder("auth_token", "jwt.token.val")
    .domain("example.com")
    .path("/")
    .isSecure(true)
    .build();

driver.manage().addCookie(authCookie);

// Step 3: Refresh or navigate to protected dashboard
driver.get("https://example.com/dashboard");
Assertions.assertFalse(driver.getCurrentUrl().contains("/login"));
```

### Recipe 2 — Managing and verifying cookies

```java
import org.openqa.selenium.Cookie;
import org.openqa.selenium.WebDriver;
import java.util.Set;

// Fetch specific cookie by name
Cookie sessionCookie = driver.manage().getCookieNamed("JSESSIONID");

// Fetch all active cookies for domain
Set<Cookie> allCookies = driver.manage().getCookies();

// Clear session state
driver.manage().deleteCookieNamed("JSESSIONID");
driver.manage().deleteAllCookies();
```

### Recipe 3 — HTML5 LocalStorage & SessionStorage via JavascriptExecutor

```java
import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.WebDriver;

JavascriptExecutor js = (JavascriptExecutor) driver;

// Set LocalStorage item for auth token injection
js.executeScript("window.localStorage.setItem(arguments[0], arguments[1]);", "authToken", "secret_jwt_token");

// Read LocalStorage item
String token = (String) js.executeScript("return window.localStorage.getItem(arguments[0]);", "authToken");

// Clear Storage
js.executeScript("window.localStorage.clear();");
js.executeScript("window.sessionStorage.clear();");
```

## Best practices

1. **Navigate to domain before adding cookies**: W3C WebDriver specification restricts adding cookies for domains that do not match the current page domain. Always load a lightweight page on the target domain first.
2. **Set explicit path and secure flags**: When building cookies with `Cookie.Builder`, explicitly declare `.path("/")` and `.isSecure(true)` to match production application policies.

## Dynamic MCP Support & Reference (Optional)

This skill is fully self-contained. If the `sdet-mcp` server is available in your workspace, you can dynamically query multi-language code references and driver options via the available `sdet-mcp` documentation tools.
