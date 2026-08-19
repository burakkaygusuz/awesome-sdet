# Playwright Storage State & Authentication — C# Reference

> Official Playwright 1.62+ C# (.NET) authentication state persistence, StorageStatePath, and cookie management.

---

## 1. Authentication State Persistence

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Storage;

public class AuthStorageExamples
{
    public static async Task SaveAuthenticationStateAsync(IBrowser browser)
    {
        var context = await browser.NewContextAsync();
        var page = await context.NewPageAsync();

        await page.GotoAsync("https://example.com/login");
        await page.GetByLabel("Username").FillAsync("standard_user");
        await page.GetByLabel("Password").FillAsync("secret_pass");
        await page.GetByRole(AriaRole.Button, new() { Name = "Sign in" }).ClickAsync();

        await page.WaitForURLAsync("**/dashboard");

        await context.StorageStateAsync(new() { Path = "playwright/.auth/user.json" });
        await context.CloseAsync();
    }
}
```

---

## 2. Reusing Saved Storage State

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Storage;

public class AuthenticatedContextExamples
{
    public static async Task<IPage> CreateAuthenticatedPageAsync(IBrowser browser)
    {
        var context = await browser.NewContextAsync(new()
        {
            StorageStatePath = "playwright/.auth/user.json"
        });
        return await context.NewPageAsync();
    }
}
```

---

## 3. Cookie Management

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Storage;

public class CookieManagementExamples
{
    public static async Task ManageCookiesAsync(IBrowserContext context)
    {
        await context.AddCookiesAsync(new[]
        {
            new Cookie
            {
                Name = "session_id",
                Value = "token_abc123",
                Domain = ".example.com",
                Path = "/"
            }
        });

        var cookies = await context.CookiesAsync(new[] { "https://example.com" });
        await context.ClearCookiesAsync();
    }
}
```
