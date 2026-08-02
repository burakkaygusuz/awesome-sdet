# Page Object Model (POM) - C# API Reference

> Official Selenium C# WebDriver binding (`OpenQA.Selenium`) modern Page Object Model pattern (Selenium 4+ & C# 12 / .NET 8 Primary Constructors).

---

## C# 12 Modern Page Object Pattern (Primary Constructors & WebDriverWait)

```csharp
using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Support.UI;

namespace Com.Example.Pages
{
    // C# 12 Primary Constructor syntax (.NET 8+)
    public class LoginPage(IWebDriver driver, int timeoutSeconds = 10)
    {
        private readonly WebDriverWait _wait = new(driver, TimeSpan.FromSeconds(timeoutSeconds));

        private By UsernameInput => By.Id("username");
        private By PasswordInput => By.Id("password");
        private By LoginButton => By.CssSelector("button[type='submit']");

        public void EnterUsername(string username)
        {
            _wait.Until(d => d.FindElement(UsernameInput)).SendKeys(username);
        }

        public void EnterPassword(string password)
        {
            _wait.Until(d => d.FindElement(PasswordInput)).SendKeys(password);
        }

        public void ClickLogin()
        {
            _wait.Until(d => d.FindElement(LoginButton)).Click();
        }

        public void Login(string username, string password)
        {
            EnterUsername(username);
            EnterPassword(password);
            ClickLogin();
        }
    }
}
```

---

## Best Practices for C# Selenium POM

1. **C# 12 Primary Constructors**: Use `public class LoginPage(IWebDriver driver)` for concise parameter passing without boilerplate backing fields in .NET 8+.
2. **PascalCase Naming**: C# methods and properties MUST use PascalCase (`EnterUsername`, `LoginButton`).
3. **`TimeSpan.FromSeconds`**: Selenium 4 in .NET requires `TimeSpan` for explicit wait timeouts.
