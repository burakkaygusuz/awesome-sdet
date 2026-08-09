# Selenium Locator Strategies — C# API Reference (Selenium 4.x+)

> Official Selenium 4 C# WebDriver binding (`OpenQA.Selenium`) locator strategies & C# 12 Primary Constructor patterns.

---

## Code Examples

```csharp
using System;
using OpenQA.Selenium;
using static OpenQA.Selenium.By;

namespace Com.Example.Locators
{
    public class LocatorExamples(IWebDriver driver)
    {
        private By UsernameInput => Id("username");
        private By SubmitButton => CssSelector("button.btn-success[type='submit']");
        private By EmailInput => Name("email");

        public void DemonstrateLocators()
        {
            IWebElement username = driver.FindElement(UsernameInput);
            IWebElement submitBtn = driver.FindElement(SubmitButton);

            // Selenium 4 Relative Locators (spatial queries: Below, LeftOf)
            IWebElement passwordInput = driver.FindElement(
                RelativeBy.WithLocator(TagName("input")).Below(username)
            );
            IWebElement cancelButton = driver.FindElement(
                RelativeBy.WithLocator(TagName("button")).LeftOf(submitBtn)
            );
        }
    }
}
```
