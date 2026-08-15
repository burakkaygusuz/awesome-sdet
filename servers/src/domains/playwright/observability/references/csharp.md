# Playwright Observability, Tracing & Visual Testing — C# Reference

> Microsoft.Playwright C# provides comprehensive tracing via `ITracing` and visual assertions via `ToHaveScreenshotAsync`.

---

## 1. Trace Recording

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Observability;

public class TracingExamples
{
    public static async Task RecordTraceAsync(IBrowser browser)
    {
        var context = await browser.NewContextAsync();
        await context.Tracing.StartAsync(new()
        {
            Screenshots = true,
            Snapshots = true,
            Sources = true
        });

        var page = await context.NewPageAsync();
        await page.GotoAsync("https://example.com/dashboard");
        await page.GetByRole(AriaRole.Button, new() { Name = "Refresh" }).ClickAsync();

        await context.Tracing.StopAsync(new()
        {
            Path = "test-results/traces/dashboard.zip"
        });

        await context.CloseAsync();
    }
}
```

---

## 2. Visual Regression Testing (`ToHaveScreenshotAsync`)

```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Playwright;
using static Microsoft.Playwright.Assertions;

namespace PlaywrightDocs.Observability;

public class VisualExamples
{
    public static async Task CaptureAndAssertAsync(IPage page)
    {
        await page.GotoAsync("https://example.com/dashboard");

        await Expect(page).ToHaveScreenshotAsync("dashboard.png", new()
        {
            MaxDiffPixelRatio = 0.02f
        });

        var clock = page.GetByTestId("live-clock");
        await Expect(page).ToHaveScreenshotAsync("dashboard-masked.png", new()
        {
            Mask = new[] { clock }
        });
    }
}
```

---

## 3. Console & Error Monitoring

```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Observability;

public class ErrorMonitoringExamples
{
    public static async Task MonitorErrorsAsync(IPage page)
    {
        var pageErrors = new List<string>();
        page.PageError += (_, error) => pageErrors.Add(error);

        await page.GotoAsync("https://example.com/dashboard");
    }
}
```
