# Playwright Storage State & Authentication — Java Reference

> Playwright Java persists authentication state across test runs using `BrowserContext.storageState`.

---

## 1. Authentication State Persistence

```java
package com.example.playwright;

import java.nio.file.Paths;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

public class AuthStorageExamples {
    public static void saveAuthenticationState(Browser browser) {
        BrowserContext context = browser.newContext();
        Page page = context.newPage();

        page.navigate("https://example.com/login");
        page.getByLabel("Username").fill("standard_user");
        page.getByLabel("Password").fill("secret_pass");
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Sign in")).click();

        page.waitForURL("**/dashboard");

        context.storageState(new BrowserContext.StorageStateOptions()
            .setPath(Paths.get("playwright/.auth/user.json")));

        context.close();
    }
}
```

---

## 2. Reusing Saved Storage State

```java
package com.example.playwright;

import java.nio.file.Paths;
import com.microsoft.playwright.Browser;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.Page;

public class AuthenticatedContextExamples {
    public static Page createAuthenticatedPage(Browser browser) {
        Browser.NewContextOptions options = new Browser.NewContextOptions()
            .setStorageStatePath(Paths.get("playwright/.auth/user.json"));

        BrowserContext context = browser.newContext(options);
        return context.newPage();
    }
}
```

---

## 3. Cookie Management

```java
package com.example.playwright;

import java.util.List;
import com.microsoft.playwright.BrowserContext;
import com.microsoft.playwright.options.Cookie;

public class CookieManagementExamples {
    public static void manageCookies(BrowserContext context) {
        context.addCookies(List.of(
            new Cookie("session_id", "token_abc123")
                .setDomain(".example.com")
                .setPath("/")
        ));

        List<Cookie> cookies = context.cookies("https://example.com");
        context.clearCookies();
    }
}
```
