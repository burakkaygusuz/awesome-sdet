# RemoteWebDriver & Enterprise Selenium Grid 4 — C# API Reference (Selenium 4.x+)

## Code Examples

```csharp
using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;

var options = new ChromeOptions();
options.AddAdditionalOption("se:downloadsEnabled", true);

IWebDriver driver = new RemoteWebDriver(new Uri("http://localhost:4444/"), options);

// Match custom node stereotypes defined in Grid TOML config
options.AddAdditionalOption("nodename:applicationName", "node_1");

driver.Navigate().GoToUrl("https://example.com");
driver.Quit();
```

## Best Practices

- **AddAdditionalOption**: Pass custom `se:` capabilities via `options.AddAdditionalOption()`.
- **Session Teardown**: Call `driver.Quit()` in `IDisposable` or `[TearDown]` methods.
