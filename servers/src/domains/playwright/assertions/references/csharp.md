# Playwright Web-First Assertions — C# Reference

> Official Playwright 1.62+ C# (.NET) auto-retrying web-first assertions (Expect) and asynchronous state verification.

---

## 1. Locator State Assertions

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;

namespace PlaywrightDocs.Assertions;

public class AssertionExamples
{
    public static async Task DemonstrateAssertionsAsync(IPage page)
    {
        ILocator submitBtn = page.GetByRole(AriaRole.Button, new() { Name = "Submit" });
        ILocator termsCheckbox = page.GetByRole(AriaRole.Checkbox, new() { Name = "Terms" });
        ILocator searchInput = page.GetByPlaceholder("Search");
        ILocator alertBanner = page.GetByRole(AriaRole.Alert);

        await Expect(submitBtn).ToBeVisibleAsync();
        await Expect(alertBanner).ToBeHiddenAsync();
        await Expect(alertBanner).ToBeAttachedAsync();

        await Expect(submitBtn).ToBeEnabledAsync();
        await Expect(submitBtn).Not.ToBeDisabledAsync();
        await Expect(searchInput).ToBeEditableAsync();
        await Expect(searchInput).ToBeFocusedAsync();

        await Expect(termsCheckbox).ToBeCheckedAsync();
        await Expect(searchInput).ToBeEmptyAsync();
    }
}
```

---

## 2. Content, Attribute & Page Assertions

```csharp
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;

namespace PlaywrightDocs.Assertions;

public class ContentAssertionExamples
{
    public static async Task DemonstrateContentAssertionsAsync(IPage page)
    {
        ILocator header = page.GetByRole(AriaRole.Heading, new() { Level = 1 });
        ILocator items = page.GetByRole(AriaRole.Listitem);
        ILocator userCard = page.GetByTestId("user-profile");
        ILocator emailInput = page.GetByLabel("User Email");

        await Expect(header).ToHaveTextAsync("Welcome to Dashboard");
        await Expect(header).ToHaveTextAsync(new Regex("welcome to", RegexOptions.IgnoreCase));
        await Expect(header).ToContainTextAsync("Dashboard");

        await Expect(userCard).ToHaveAttributeAsync("data-status", "active");
        await Expect(userCard).ToHaveClassAsync(new Regex("card-highlighted"));
        await Expect(userCard).ToHaveIdAsync("user-42");

        await Expect(emailInput).ToHaveValueAsync("admin@example.com");
        await Expect(items).ToHaveCountAsync(5);

        await Expect(page).ToHaveURLAsync("https://example.com/dashboard");
        await Expect(page).ToHaveTitleAsync("Enterprise SDET Dashboard");
    }
}
```
