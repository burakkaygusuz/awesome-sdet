# Appium Mobile Locator Strategies — C# API Reference (Appium 3.x+)

> Official Appium 3.6.0+ .NET Client (`MobileBy`) selector strategies and element queries.

---

## 1. Selector Strategies Implementation

```csharp
using OpenQA.Selenium;
using OpenQA.Selenium.Appium;

namespace AwesomeSdet.Appium
{
    public static class AppiumLocatorStrategies
    {
        public static void LocateElements(AppiumDriver driver)
        {
            // 1. Accessibility ID (Cross-Platform Gold Standard)
            var loginBtn = driver.FindElement(MobileBy.AccessibilityId("login_button"));
            loginBtn.Click();

            // 2. iOS Class Chain
            var navTitle = driver.FindElement(
                MobileBy.IosClassChain("**/XCUIElementTypeNavigationBar/XCUIElementTypeStaticText[`label == 'Settings'`]")
            );
            var text = navTitle.Text;

            // 3. iOS Predicate String
            var saveBtn = driver.FindElement(
                MobileBy.IosNsPredicate("type == 'XCUIElementTypeButton' AND name == 'Save' AND visible == 1")
            );
            saveBtn.Click();

            // 4. Android UiAutomator
            var toggleSwitch = driver.FindElement(
                MobileBy.AndroidUIAutomator("new UiSelector().className(\"android.widget.Switch\").checked(false)")
            );
            toggleSwitch.Click();

            // 5. Android UiScrollable
            var termsItem = driver.FindElement(
                MobileBy.AndroidUIAutomator("new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text(\"Terms of Service\"))")
            );
            termsItem.Click();

            // 6. Resource ID
            var usernameField = driver.FindElement(MobileBy.Id("com.example.app:id/txt_username"));
            usernameField.SendKeys("csharp_user");
        }
    }
}
```

---

## 2. Best Practices & Invariants

- **Use `MobileBy`**: Use `MobileBy.AccessibilityId` and `MobileBy.IosClassChain` for mobile-native strategies.
- **Scroll Into View**: Use `MobileBy.AndroidUIAutomator` with `UiScrollable` to reliably target offscreen items.
