# RemoteWebDriver & Enterprise Selenium Grid 4 — C# API Reference (Selenium 4.x+)

## Code Examples

```csharp
using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;

var options = new ChromeOptions();
options.AddAdditionalOption("se:downloadsEnabled", true);
options.AddAdditionalOption("nodename:applicationName", "node_1");

IWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/"), options);

driver.Navigate().GoToUrl("https://example.com");
driver.Quit();
```

## Best Practices

- **AddAdditionalOption**: Pass custom `se:` capabilities via `options.AddAdditionalOption()`.
- **Session Teardown**: Call `driver.Quit()` in `IDisposable` or `[TearDown]` methods.
