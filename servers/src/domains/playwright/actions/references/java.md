# Playwright Actions & Auto-Waiting — Java Reference

> Playwright Java API provides strong types and built-in auto-waiting actionability checks for deterministic automation.

---

## 1. Actionability Guarantees

Playwright Java waits for elements to be attached, visible, stable, enabled, and ready for pointer events before invoking interactions.

---

## 2. Common User Interactions

```java
package com.example.playwright;

import java.util.Arrays;
import java.util.List;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;
import com.microsoft.playwright.options.KeyboardModifier;
import com.microsoft.playwright.options.MouseButton;
import com.microsoft.playwright.options.SelectOption;

public class ActionExamples {
    public static void demonstrateActions(Page page) {
        Locator submitBtn = page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Submit"));
        Locator emailInput = page.getByLabel("Email Address");
        Locator roleSelect = page.getByRole(AriaRole.COMBOBOX, new Page.GetByRoleOptions().setName("Role"));
        Locator newsletterCheck = page.getByRole(AriaRole.CHECKBOX, new Page.GetByRoleOptions().setName("Subscribe"));

        submitBtn.click();
        submitBtn.dblclick();
        submitBtn.click(new Locator.ClickOptions().setButton(MouseButton.RIGHT));
        submitBtn.click(new Locator.ClickOptions().setModifiers(Arrays.asList(KeyboardModifier.CONTROL, KeyboardModifier.SHIFT)));

        emailInput.fill("user@example.com");
        emailInput.pressSequentially("user@example.com", new Locator.PressSequentiallyOptions().setDelay(50));

        emailInput.press("Enter");
        emailInput.press("Control+A");
        page.keyboard().press("Escape");

        newsletterCheck.check();
        newsletterCheck.uncheck();
        newsletterCheck.setChecked(true);

        roleSelect.selectOption("ADMIN");
        roleSelect.selectOption(new SelectOption().setLabel("Engineering Manager"));
        roleSelect.selectOption(new SelectOption().setIndex(2));

        page.getByRole(AriaRole.MENUITEM, new Page.GetByRoleOptions().setName("Settings")).hover();
        emailInput.focus();
        emailInput.blur();
    }
}
```

---

## 3. Drag and Drop & File Uploads

```java
package com.example.playwright;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.charset.StandardCharsets;
import com.microsoft.playwright.Locator;
import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.FilePayload;

public class AdvancedActionExamples {
    public static void demonstrateAdvancedActions(Page page) {
        Locator source = page.getByTestId("draggable-item");
        Locator target = page.getByTestId("drop-target-zone");
        source.dragTo(target);

        Locator fileInput = page.getByLabel("Upload Resume");
        fileInput.setInputFiles(Paths.get("fixtures/resume.pdf"));
        fileInput.setInputFiles(new Path[] { Paths.get("fixtures/doc1.pdf"), Paths.get("fixtures/doc2.pdf") });

        byte[] buffer = "id,name\n1,Alpha\n2,Beta".getBytes(StandardCharsets.UTF_8);
        fileInput.setInputFiles(new FilePayload("report.csv", "text/csv", buffer));
    }
}
```
