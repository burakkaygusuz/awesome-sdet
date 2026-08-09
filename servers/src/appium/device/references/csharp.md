# Appium Device & App Lifecycle Management — C# API Reference (Appium 3.6.0+)

> Official Appium 3.6.0+ .NET Client (`IInteractsWithApps`) application lifecycle controls and device state management.

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

            if (driver is IInteractsWithApps appDriver)
            {
                // 1. Install & Activate
                if (!appDriver.IsAppInstalled(bundleId))
                {
                    appDriver.InstallApp("/path/to/app.apk");
                }

                appDriver.ActivateApp(bundleId);

                // 2. Background App
                appDriver.BackgroundApp(TimeSpan.FromSeconds(5));

                // 3. Query App State
                var state = appDriver.GetAppState(bundleId);
                Console.WriteLine($"State: {state}");

                // 4. Terminate App
                appDriver.TerminateApp(bundleId);
            }
        }
    }
}
```

---

## 2. Best Practices & Invariants

- **Use `IInteractsWithApps`**: Cast driver to `IInteractsWithApps` for clean application operations.
- **Explicit TimeSpans**: Provide `TimeSpan.FromSeconds()` for background timeouts.
