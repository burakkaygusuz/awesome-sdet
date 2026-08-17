# Playwright Actions & Auto-Waiting — C# Reference

> Official Playwright 1.62+ C# (.NET) auto-waiting actions, keyboard/mouse input, and file uploads.

---

## 1. Actionability Guarantees

Before triggering any action, Playwright verifies that the target element is attached, visible, stable, enabled, and ready for pointer events.

---

## 2. Common User Interactions

```csharp
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Actions;

public class ActionExamples
{
    public static async Task DemonstrateActionsAsync(IPage page)
    {
        ILocator submitBtn = page.GetByRole(AriaRole.Button, new() { Name = "Submit" });
        ILocator emailInput = page.GetByLabel("Email Address");
        ILocator roleSelect = page.GetByRole(AriaRole.Combobox, new() { Name = "Role" });
        ILocator newsletterCheck = page.GetByRole(AriaRole.Checkbox, new() { Name = "Subscribe" });

        await submitBtn.ClickAsync();
        await submitBtn.DblClickAsync();
        await submitBtn.ClickAsync(new() { Button = MouseButton.Right });
        await submitBtn.ClickAsync(new() { Modifiers = new[] { KeyboardModifier.Control, KeyboardModifier.Shift } });

        await emailInput.FillAsync("user@example.com");
        await emailInput.PressSequentiallyAsync("user@example.com", new() { Delay = 50 });

        await emailInput.PressAsync("Enter");
        await emailInput.PressAsync("Control+A");
        await page.Keyboard.PressAsync("Escape");

        await newsletterCheck.CheckAsync();
        await newsletterCheck.UncheckAsync();
        await newsletterCheck.SetCheckedAsync(true);

        await roleSelect.SelectOptionAsync("ADMIN");
        await roleSelect.SelectOptionAsync(new SelectOptionValue { Label = "Engineering Manager" });
        await roleSelect.SelectOptionAsync(new SelectOptionValue { Index = 2 });

        await page.GetByRole(AriaRole.Menuitem, new() { Name = "Settings" }).HoverAsync();
        await emailInput.FocusAsync();
        await emailInput.BlurAsync();
    }
}
```

---

## 3. Drag and Drop & File Uploads

```csharp
using System.Text;
using System.Threading.Tasks;
using Microsoft.Playwright;

namespace PlaywrightDocs.Actions;

public class AdvancedActionExamples
{
    public static async Task DemonstrateAdvancedActionsAsync(IPage page)
    {
        ILocator source = page.GetByTestId("draggable-item");
        ILocator target = page.GetByTestId("drop-target-zone");
        await source.DragToAsync(target);

        ILocator fileInput = page.GetByLabel("Upload Resume");
        await fileInput.SetInputFilesAsync("fixtures/resume.pdf");
        await fileInput.SetInputFilesAsync(new[] { "fixtures/doc1.pdf", "fixtures/doc2.pdf" });

        byte[] buffer = Encoding.UTF8.GetBytes("id,name\n1,Alpha\n2,Beta");
        await fileInput.SetInputFilesAsync(new FilePayload
        {
            Name = "report.csv",
            MimeType = "text/csv",
            Buffer = buffer
        });
    }
}
```
