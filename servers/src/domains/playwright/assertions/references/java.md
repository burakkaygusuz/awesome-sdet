# Playwright Web-First Assertions — Java Reference

> Official Playwright 1.62+ Java auto-retrying web-first assertions (PlaywrightAssertions.assertThat) and attribute verification.

---

## 1. Locator State Assertions

```java
package com.example.playwright;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

public class AssertionExamples {
    public static void demonstrateAssertions(Page page) {
        Locator submitBtn = page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit"));
        Locator termsCheckbox = page.getByRole(AriaRole.CHECKBOX, new Page.GetByRoleOptions().setName("Terms"));
        Locator searchInput = page.getByPlaceholder("Search");
        Locator alertBanner = page.getByRole(AriaRole.ALERT);

        assertThat(submitBtn).isVisible();
        assertThat(alertBanner).isHidden();
        assertThat(alertBanner).isAttached();

        assertThat(submitBtn).isEnabled();
        assertThat(submitBtn).not().isDisabled();
        assertThat(searchInput).isEditable();
        assertThat(searchInput).isFocused();

        assertThat(termsCheckbox).isChecked();
        assertThat(searchInput).isEmpty();
    }
}
```

---

## 2. Content, Attribute & Page Assertions

```java
package com.example.playwright;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import java.util.regex.Pattern;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

public class ContentAssertionExamples {
    public static void demonstrateContentAssertions(Page page) {
        Locator header = page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setLevel(1));
        Locator items = page.getByRole(AriaRole.LISTITEM);
        Locator userCard = page.getByTestId("user-profile");
        Locator emailInput = page.getByLabel("User Email");

        assertThat(header).hasText("Welcome to Dashboard");
        assertThat(header).hasText(Pattern.compile("welcome to", Pattern.CASE_INSENSITIVE));
        assertThat(header).containsText("Dashboard");

        assertThat(userCard).hasAttribute("data-status", "active");
        assertThat(userCard).hasClass(Pattern.compile("card-highlighted"));
        assertThat(userCard).hasId("user-42");

        assertThat(emailInput).hasValue("admin@example.com");
        assertThat(items).hasCount(5);

        assertThat(page).hasURL("https://example.com/dashboard");
        assertThat(page).hasTitle("Enterprise SDET Dashboard");
    }
}
```
