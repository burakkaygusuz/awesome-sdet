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

            IWebElement passwordInput = driver.FindElement(
                RelativeBy.WithLocator(TagName("input")).Below(username)
            );
            passwordInput.SendKeys("secret123");

            IWebElement cancelButton = driver.FindElement(
                RelativeBy.WithLocator(TagName("button")).ToLeftOf(submitBtn)
            );
            cancelButton.Click();
        }
    }
}
```

## Shadow DOM Piercing

Selenium 4 exposes open shadow roots via `GetShadowRoot()`; query inside them with standard locators:

```csharp
IWebElement shadowHost = driver.FindElement(By.CssSelector("my-card"));
ISearchContext shadowRoot = shadowHost.GetShadowRoot();
IWebElement inner = shadowRoot.FindElement(By.CssSelector("p"));
ISearchContext nestedRoot = shadowRoot.FindElement(By.CssSelector("child-widget")).GetShadowRoot();
```

## Link Text Strategies

Anchor-only strategies: `By.LinkText("Sign in")` / `By.PartialLinkText("Sign")`.
