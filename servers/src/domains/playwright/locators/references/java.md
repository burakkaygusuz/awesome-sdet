# Playwright Locators & Selectors — Java Reference

> Official Playwright 1.62+ Java locator strategies, accessibility queries, filtering, and chaining.

---

## 1. Recommended User-Facing Locators

Prefer accessibility semantics and user-facing contracts over brittle CSS or XPath selectors:

```java
package com.example.playwright;

import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.SelectOption;

public class LocatorExamples {
    public static void demonstrateLocators(Page page) {
        Locator submitBtn = page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit Order"));
        Locator navHeading = page.getByRole(AriaRole.HEADING, new Page.GetByRoleOptions().setName("Dashboard").setLevel(1));
        Locator termsCheckbox = page.getByRole(AriaRole.CHECKBOX, new Page.GetByRoleOptions().setName("I agree to Terms"));
        Locator countrySelect = page.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName("Country"));
        Locator usernameInput = page.getByLabel("Username or Email");
        Locator searchInput = page.getByPlaceholder("Search products, categories...");
        Locator welcomeText = page.getByText("Welcome back, Admin!");
        Locator companyLogo = page.getByAltText("Acme Corporation");
        Locator closeBtn = page.getByTitle("Close modal");
        Locator dataCard = page.getByTestId("user-summary-card");

        submitBtn.click();
        navHeading.waitFor();
        termsCheckbox.check();
        countrySelect.selectOption(new SelectOption().setValue("US"));
        usernameInput.fill("jane@example.com");
        searchInput.fill("mouse");
        welcomeText.waitFor();
        companyLogo.waitFor();
        closeBtn.waitFor();
        dataCard.waitFor();
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

        Locator pendingItems = page.getByRole(AriaRole.ROW)
            .filter(new Locator.FilterOptions().setHasNot(page.getByText("Completed")));

        Locator visibleButtons = page.locator("button:visible");

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
