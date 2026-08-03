# WebDriver BiDi Protocol — C# API Reference (Selenium 4.46.0+)

> Official Selenium 4 C# WebDriver BiDi (`OpenQA.Selenium.BiDi`).

---

## Code Examples

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.BiDi;

public class BidiExamples
{
    public async Task DemonstrateBidiAsync(IWebDriver driver)
    {
        // 1. BiDi session initialization
        var bidi = await driver.AsBiDiAsync();

        // 2. Log inspector / Console events
        bidi.Log.ConsoleEntryAdded += (sender, e) =>
        {
            Console.WriteLine($"Console message: {e.Text}");
        };
    }
}
```

## Best Practices

- **Enable BiDi Capability**: BiDi must be enabled in `DriverOptions` before starting the session.
- **Use BiDi over CDP**: Prefer W3C BiDi over CDP for cross-browser support (Chrome, Edge, Firefox).
- **Clean up listeners**: Unsubscribe C# events (`ConsoleEntryAdded -= ...`) during teardown.
