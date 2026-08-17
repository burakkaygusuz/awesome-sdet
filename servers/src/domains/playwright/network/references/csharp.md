# Playwright Network Mocking & API Testing — C# Reference

> Official Playwright 1.62+ C# (.NET) network interception (RouteAsync), HAR mocking, and IAPIRequestContext.

---

## 1. Network Interception & Mocking (`page.RouteAsync`)

```csharp
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Network;

public class NetworkMockingExamples
{
    public static async Task DemonstrateMockingAsync(IPage page)
    {
        await page.RouteAsync("**/api/v1/user/profile", async (route) =>
        {
            var mockProfile = new
            {
                id = "usr_42",
                name = "Jane Doe",
                role = "ADMIN"
            };
            await route.FulfillAsync(new()
            {
                Status = 200,
                ContentType = "application/json",
                Body = JsonSerializer.Serialize(mockProfile)
            });
        });

        await page.RouteAsync("**/*analytics*/**", async (route) => await route.AbortAsync());

        await page.RouteAsync("**/api/v1/secure/**", async (route) =>
        {
            var headers = new Dictionary<string, string>(await route.Request.AllHeadersAsync())
            {
                ["X-Mock-Authorization"] = "Bearer test-token-123"
            };
            await route.ContinueAsync(new() { Headers = headers });
        });

        await page.UnrouteAsync("**/api/v1/user/profile");
    }
}
```

---

## 2. HAR Replay

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Network;

public class HarReplayExamples
{
    public static async Task ReplayHarAsync(IPage page)
    {
        await page.RouteFromHARAsync("fixtures/har/checkout.har", new()
        {
            Url = "**/api/checkout/**",
            Update = false
        });
        await page.GotoAsync("/checkout");
    }
}
```

---

## 3. Pure API Testing with `IAPIRequestContext`

```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;

namespace PlaywrightDocs.Network;

public class ApiTestingExamples
{
    public static async Task TestApiAsync(IPlaywright playwright)
    {
        var request = await playwright.APIRequest.NewContextAsync(new()
        {
            BaseURL = "https://api.example.com",
            ExtraHTTPHeaders = new Dictionary<string, string>
            {
                ["Authorization"] = "Bearer token-123"
            }
        });

        var createRes = await request.PostAsync("/api/v1/users", new()
        {
            DataObject = new { username = "sdet_user", email = "sdet@example.com" }
        });

        var getRes = await request.GetAsync("/api/v1/users/42");

        await request.DisposeAsync();
    }
}
```

---

## 4. Synchronizing Actions with Network Responses

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Network;

public class NetworkSyncExamples
{
    public static async Task WaitForResponseExampleAsync(IPage page)
    {
        await page.GotoAsync("/cart");

        var response = await page.RunAndWaitForResponseAsync(
            async () => await page.GetByRole(AriaRole.Button, new() { Name = "Place Order" }).ClickAsync(),
            res => res.Url.Contains("/api/checkout") && res.Status == 200
        );
    }
}
```
