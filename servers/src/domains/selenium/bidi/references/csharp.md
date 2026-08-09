# WebDriver BiDi Protocol — C# API Reference (Selenium 4.x+)

> Official Selenium 4 C# WebDriver BiDi (`OpenQA.Selenium.BiDi`).

---

## Code Examples

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.BiDi;

public class BidiExamples
{
    public async Task DemonstrateBidiAsync()
    {
        var options = new ChromeOptions
        {
            UseWebSocketUrl = true
        };

        IWebDriver driver = new ChromeDriver(options);

        var bidi = await driver.AsBiDiAsync();

        bidi.Log.ConsoleEntryAdded += (sender, e) =>
        {
            Console.WriteLine($"Console message: {e.Text}");
        };
    }
}
```

## Best Practices

- **Enable BiDi Capability**: BiDi must be enabled in `DriverOptions` (`UseWebSocketUrl = true`) before starting the session.
- **Use BiDi over CDP**: Prefer W3C BiDi over CDP for cross-browser support (Chrome, Edge, Firefox).
- **Clean up listeners**: Unsubscribe C# events (`ConsoleEntryAdded -= ...`) during teardown.
