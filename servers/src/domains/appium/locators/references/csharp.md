# Appium Mobile Locator Strategies — C# API Reference (Appium 2.x+)

> Official Appium 2.x .NET Client (`OpenQA.Selenium.Appium.MobileBy`) selector strategies and element queries.

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
            var loginBtn = driver.FindElement(MobileBy.AccessibilityId("login_button"));
            loginBtn.Click();

            var navTitle = driver.FindElement(
                MobileBy.IosClassChain("**/XCUIElementTypeNavigationBar/XCUIElementTypeStaticText[`label == 'Settings'`]")
            );
            var text = navTitle.Text;

            var saveBtn = driver.FindElement(
                MobileBy.IosNSPredicate("type == 'XCUIElementTypeButton' AND name == 'Save' AND visible == 1")
            );
            saveBtn.Click();

            var toggleSwitch = driver.FindElement(
                MobileBy.AndroidUIAutomator("new UiSelector().className(\"android.widget.Switch\").checked(false)")
            );
            toggleSwitch.Click();

            var termsItem = driver.FindElement(
                MobileBy.AndroidUIAutomator("new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().text(\"Terms of Service\"))")
            );
            termsItem.Click();

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

## Image Locator

- Image-based locator for canvas UIs without semantic attributes: `MobileBy.Image("path/to/element.png")` (requires the Appium images plugin).
