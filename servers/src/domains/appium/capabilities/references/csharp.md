# Appium Driver Architecture & W3C Capabilities — C# API Reference (Appium 2.x+)

> Official Appium 2.x .NET Client (`OpenQA.Selenium.Appium.AppiumOptions`) capabilities and driver instantiation.

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

            options.AddAdditionalAppiumOption("appPackage", "com.example.app");
            options.AddAdditionalAppiumOption("appActivity", "com.example.app.MainActivity");
            options.AddAdditionalAppiumOption("noReset", false);
            options.AddAdditionalAppiumOption("autoGrantPermissions", true);
            options.AddAdditionalAppiumOption("newCommandTimeout", 300);

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

            options.AddAdditionalAppiumOption("bundleId", "com.example.sampleapp");
            options.AddAdditionalAppiumOption("noReset", true);
            options.AddAdditionalAppiumOption("wdaLocalPort", 8100);

            return new IOSDriver(new Uri(serverUrl), options, TimeSpan.FromSeconds(120));
        }
    }
}
```

---

## 3. Best Practices & Invariants

- **Use `AddAdditionalAppiumOption`**: Pass custom and driver-specific capabilities through `options.AddAdditionalAppiumOption()`.
- **Dispose Drivers**: Implement `IDisposable` or wrap test execution in `using var driver = ...`.
- **Command Timeout**: Always provide explicit `TimeSpan` command timeout on driver creation.
