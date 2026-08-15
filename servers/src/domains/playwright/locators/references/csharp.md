# Playwright Locators & Selectors — C# Reference

> Microsoft.Playwright C# binding provides asynchronous, strongly-typed locators with built-in auto-waiting.

---

## 1. Recommended User-Facing Locators

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Locators;

public class LocatorExamples
{
    public static async Task DemonstrateLocatorsAsync(IPage page)
    {
        ILocator submitBtn = page.GetByRole(AriaRole.Button, new() { Name = "Submit Order" });
        ILocator heading = page.GetByRole(AriaRole.Heading, new() { Name = "Dashboard", Level = 1 });
        ILocator termsCheckbox = page.GetByRole(AriaRole.Checkbox, new() { Name = "I agree to Terms" });
        ILocator countrySelect = page.GetByRole(AriaRole.Combobox, new() { Name = "Country" });

        ILocator usernameInput = page.GetByLabel("Username or Email");
        ILocator passwordInput = page.GetByLabel("Password");

        ILocator searchField = page.GetByPlaceholder("Search products, categories...");

        ILocator welcomeText = page.GetByText("Welcome back, Admin!");
        ILocator exactText = page.GetByText("Active", new() { Exact = true });

        ILocator logo = page.GetByAltText("Acme Corporation");
        ILocator closeBtn = page.GetByTitle("Close modal");
        ILocator card = page.GetByTestId("user-summary-card");
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
