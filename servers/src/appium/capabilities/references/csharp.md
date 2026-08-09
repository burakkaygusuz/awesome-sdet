# Appium Driver Architecture & W3C Capabilities — C# API Reference (Appium 3.6.0+)

> Official Appium 3.6.0+ .NET Client (`Appium.WebDriver` 5.x+) AppiumOptions and driver instantiation.

---

## 1. Android Driver Setup (AppiumOptions)

```csharp
using System;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Android;

namespace AwesomeSdet.Appium
{
    public static class AndroidDriverFactory
    {
        public static AndroidDriver CreateDriver(string serverUrl = "http://127.0.0.1:4723")
        {
            var options = new AppiumOptions
            {
                PlatformName = "Android",
                AutomationName = "UiAutomator2",
                DeviceName = "Pixel_7_API_34",
                App = "/path/to/app.apk"
            };

            options.AddAdditionalAppiumOption("appium:appPackage", "com.example.app");
            options.AddAdditionalAppiumOption("appium:appActivity", "com.example.app.MainActivity");
            options.AddAdditionalAppiumOption("appium:noReset", false);
            options.AddAdditionalAppiumOption("appium:autoGrantPermissions", true);
            options.AddAdditionalAppiumOption("appium:newCommandTimeout", 300);

            return new AndroidDriver(new Uri(serverUrl), options, TimeSpan.FromSeconds(120));
        }
    }
}
```

---

## 2. iOS Driver Setup (AppiumOptions)

```csharp
using System;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.iOS;

namespace AwesomeSdet.Appium
{
    public static class IOSDriverFactory
    {
        public static IOSDriver CreateDriver(string serverUrl = "http://127.0.0.1:4723")
        {
            var options = new AppiumOptions
            {
                PlatformName = "iOS",
                AutomationName = "XCUITest",
                DeviceName = "iPhone 15 Pro",
                PlatformVersion = "17.2"
            };

            options.AddAdditionalAppiumOption("appium:bundleId", "com.example.sampleapp");
            options.AddAdditionalAppiumOption("appium:noReset", true);
            options.AddAdditionalAppiumOption("appium:wdaLocalPort", 8100);

            return new IOSDriver(new Uri(serverUrl), options, TimeSpan.FromSeconds(120));
        }
    }
}
```

---

## 3. Best Practices & Invariants

- **Prefix Custom Options**: Use `options.AddAdditionalAppiumOption("appium:...", value)`.
- **Dispose Drivers**: Implement `IDisposable` or wrap test execution in `using var driver = ...`.
- **Command Timeout**: Always provide explicit `TimeSpan` command timeout on driver creation.
