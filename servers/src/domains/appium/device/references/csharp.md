# Appium Device & Application Management — C# API Reference (Appium 2.x+)

> Official Appium 2.x .NET Client (`IInteractsWithApps`) application lifecycle controls and device state management.

---

## 1. Application Lifecycle & Device Controls

```csharp
using System;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Interfaces;

namespace AwesomeSdet.Appium
{
    public static class AppiumDeviceManager
    {
        public static void ControlApp(AppiumDriver driver)
        {
            var bundleId = "com.example.sampleapp";
            try
            {
                if (driver is IInteractsWithApps appDriver)
                {
                    if (!appDriver.IsAppInstalled(bundleId))
                    {
                        appDriver.InstallApp("/path/to/app.apk");
                    }

                    appDriver.ActivateApp(bundleId);
                    appDriver.BackgroundApp(TimeSpan.FromSeconds(5));

                    var state = appDriver.GetAppState(bundleId);
                    Console.WriteLine($"State: {state}");

                    appDriver.TerminateApp(bundleId);
                }
            }
            finally
            {
                driver.Quit();
            }
        }
    }
}
```

---

## 2. Best Practices & Invariants

- **Use `IInteractsWithApps`**: Cast driver to `IInteractsWithApps` for clean application operations.
- **Explicit TimeSpans**: Provide `TimeSpan.FromSeconds()` for background timeouts.
