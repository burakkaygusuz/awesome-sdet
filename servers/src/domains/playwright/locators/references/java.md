# Playwright Locators & Selectors — Java Reference

> Playwright Java API provides type-safe, auto-waiting locators anchored to accessibility roles and resilient locators.

---

## 1. Recommended User-Facing Locators

```java
package com.example.playwright;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

public class LocatorExamples {
    public static void demonstrateLocators(Page page) {
        Locator submitBtn = page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit Order"));
        Locator heading = page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Dashboard").setLevel(1));
        Locator termsCheckbox = page.getByRole(AriaRole.CHECKBOX, new Page.GetByRoleOptions().setName("I agree to Terms"));
        Locator countrySelect = page.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName("Country"));

        Locator usernameInput = page.getByLabel("Username or Email");
        Locator passwordInput = page.getByLabel("Password");

        Locator searchField = page.getByPlaceholder("Search products, categories...");

        Locator welcomeText = page.getByText("Welcome back, Admin!");
        Locator exactText = page.getByText("Active", new Page.GetByTextOptions().setExact(true));

        Locator logo = page.getByAltText("Acme Corporation");
        Locator closeBtn = page.getByTitle("Close modal");
        Locator card = page.getByTestId("user-summary-card");
    }
}
```

---

## 2. Locator Filtering & Chaining

```java
package com.example.playwright;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

public class FilterAndChainExamples {
    public static void demonstrateFilterAndChain(Page page) {
        Locator productRow = page.getByRole(AriaRole.LISTITEM)
            .filter(new Locator.FilterOptions().setHasText("Wireless Mouse"));
        productRow.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Add to Cart")).click();

        Locator activeRow = page.getByRole(AriaRole.ROW)
            .filter(new Locator.FilterOptions().setHas(page.getByRole(AriaRole.STATUS, new Page.GetByRoleOptions().setName("Active"))));

        Locator dialog = page.getByRole(AriaRole.DIALOG, new Page.GetByRoleOptions().setName("Edit Profile"));
        dialog.getByRole(AriaRole.TEXTBOX, new Locator.GetByRoleOptions().setName("Full Name")).fill("Jane Doe");
        dialog.getByRole(AriaRole.BUTTON, new Locator.GetByRoleOptions().setName("Save")).click();
    }
}
```

---

## 3. Element Lists & Iteration

```java
package com.example.playwright;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

public class ListExamples {
    public static void handleLists(Page page) {
        Locator items = page.getByRole(AriaRole.LISTITEM);

        assertThat(items).hasCount(5);

        Locator first = items.first();
        Locator last = items.last();
        Locator third = items.nth(2);

        for (Locator item : items.all()) {
            System.out.println("Item: " + item.textContent());
        }
    }
}
```
