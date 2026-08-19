# Playwright Locators & Selectors — C# Reference

> Official Playwright 1.62+ C# (.NET) locator strategies, accessibility queries, filtering, and chaining.

---

## 1. Recommended User-Facing Locators

Prefer accessibility semantics and user-facing contracts over brittle CSS or XPath selectors:

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Locators;

public class LocatorExamples
{
    public static async Task DemonstrateLocatorsAsync(IPage page)
    {
        ILocator submitBtn = page.GetByRole(AriaRole.Button, new() { Name = "Submit Order" });
        ILocator navHeading = page.GetByRole(AriaRole.Heading, new() { Name = "Dashboard", Level = 1 });
        ILocator termsCheckbox = page.GetByRole(AriaRole.Checkbox, new() { Name = "I agree to Terms" });
        ILocator countrySelect = page.GetByRole(AriaRole.Combobox, new() { Name = "Country" });
        ILocator usernameInput = page.GetByLabel("Username or Email");
        ILocator searchInput = page.GetByPlaceholder("Search products, categories...");
        ILocator welcomeText = page.GetByText("Welcome back, Admin!");
        ILocator companyLogo = page.GetByAltText("Acme Corporation");
        ILocator closeBtn = page.GetByTitle("Close modal");
        ILocator dataCard = page.GetByTestId("user-summary-card");

        await submitBtn.ClickAsync();
        await navHeading.WaitForAsync();
        await termsCheckbox.CheckAsync();
        await countrySelect.SelectOptionAsync("US");
        await usernameInput.FillAsync("jane@example.com");
        await searchInput.FillAsync("mouse");
        await welcomeText.WaitForAsync();
        await companyLogo.WaitForAsync();
        await closeBtn.WaitForAsync();
        await dataCard.WaitForAsync();
    }
}
```

---

## 2. Locator Filtering & Chaining

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Locators;

public class FilterAndChainExamples
{
    public static async Task DemonstrateFilterAndChainAsync(IPage page)
    {
        ILocator productRow = page.GetByRole(AriaRole.Listitem)
            .Filter(new() { HasText = "Wireless Mouse" });
        await productRow.GetByRole(AriaRole.Button, new() { Name = "Add to Cart" }).ClickAsync();

        ILocator activeRow = page.GetByRole(AriaRole.Row)
            .Filter(new() { Has = page.GetByRole(AriaRole.Status, new() { Name = "Active" }) });

        ILocator pendingItems = page.GetByRole(AriaRole.Row)
            .Filter(new() { HasNot = page.GetByText("Completed") });

        ILocator visibleButtons = page.Locator("button:visible");

        ILocator dialog = page.GetByRole(AriaRole.Dialog, new() { Name = "Edit Profile" });
        await dialog.GetByRole(AriaRole.Textbox, new() { Name = "Full Name" }).FillAsync("Jane Doe");
        await dialog.GetByRole(AriaRole.Button, new() { Name = "Save" }).ClickAsync();
    }
}
```

---

## 3. Element Lists & Iteration

```csharp
using System;
using System.Threading.Tasks;
using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;

namespace PlaywrightDocs.Locators;

public class ListExamples
{
    public static async Task HandleListsAsync(IPage page)
    {
        ILocator items = page.GetByRole(AriaRole.Listitem);

        await Expect(items).ToHaveCountAsync(5);

        ILocator first = items.First;
        ILocator last = items.Last;
        ILocator third = items.Nth(2);

        foreach (var item in await items.AllAsync())
        {
            Console.WriteLine($"Item: {await item.TextContentAsync()}");
        }
    }
}
```
