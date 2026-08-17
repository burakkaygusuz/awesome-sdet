# WebDriver BiDi Protocol — C# API Reference (Selenium 4.x+)

> Official Selenium 4 C# WebDriver BiDi (`OpenQA.Selenium.BiDi`).

---

## Enabling BiDi

```csharp
var options = new ChromeOptions { UseWebSocketUrl = true };
IWebDriver driver = new ChromeDriver(options);
```

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
        var options = new ChromeOptions { UseWebSocketUrl = true };
        using IWebDriver driver = new ChromeDriver(options);
        await using var bidi = await driver.AsBiDiAsync();

        await bidi.Log.OnEntryAddedAsync(entry => Console.WriteLine($"Console: {entry.Text}"));

        driver.Navigate().GoToUrl("https://www.selenium.dev/selenium/web/bidi/logEntryAdded.html");
        driver.FindElement(By.Id("consoleLog")).Click();
    }
}
```

## Best Practices

- **Enable BiDi in options**: Set `UseWebSocketUrl = true` on `DriverOptions` before starting the session.
- **Use `AsBiDiAsync()`**: Connect to the BiDi WebSocket via the `AsBiDiAsync()` extension method on `IWebDriver`.
- **Use BiDi over CDP**: Prefer W3C BiDi over CDP for cross-browser support (Chrome, Edge, Firefox).
- **Dispose BiDi session**: Use `await using` on the BiDi connection to release WebSocket resources on teardown.
