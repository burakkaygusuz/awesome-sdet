# Appium Hybrid Context Switching — C# API Reference (Appium 2.x+)

> Official Appium 2.x .NET Client (`IContextAware`) hybrid context navigation and WebView DOM automation.

---

## 1. Context Switching Implementation

```csharp
using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Appium;
using OpenQA.Selenium.Appium.Interfaces;
using OpenQA.Selenium.Support.UI;

namespace AwesomeSdet.Appium
{
    public static class AppiumContextManager
    {
        public static void SwitchToWebView(AppiumDriver driver)
        {
            if (driver is IContextAware contextAwareDriver)
            {
                var contexts = contextAwareDriver.Contexts;
                Console.WriteLine($"Available contexts: {contexts.Count}");

                foreach (var context in contexts)
                {
                    if (context.Contains("WEBVIEW"))
                    {
                        contextAwareDriver.Context = context;
                        try
                        {
                            Console.WriteLine($"Switched to: {contextAwareDriver.Context}");
                            var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));
                            var submitBtn = wait.Until(d => d.FindElement(By.CssSelector("button.action-submit")));
                            submitBtn.Click();
                        }
                        finally
                        {
                            contextAwareDriver.Context = "NATIVE_APP";
                            Console.WriteLine($"Active Context: {contextAwareDriver.Context}");
                        }
                        break;
                    }
                }
            }
        }
    }
}
```

---

## 2. Best Practices & Invariants

- **Use `IContextAware`**: Cast driver to `IContextAware` for accessing `.Context` and `.Contexts`.
- **Clean Context Restorations**: Always restore `"NATIVE_APP"` before performing native gestures.
- **Selenium Interoperability**: `AppiumDriver` inherits from `WebDriver`; standard `OpenQA.Selenium.By` and `WebDriverWait` apply inside WebViews (see `selenium://locators/csharp`).
