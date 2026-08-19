# Playwright Actions & Auto-Waiting — Java Reference

> Official Playwright 1.62+ Java auto-waiting interactions, keyboard/mouse events, drag-and-drop, and file uploads.

---

## 1. Common User Interactions

```java
package com.example.playwright;

import java.util.Arrays;
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

## 2. Drag and Drop & File Uploads

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

---

## 3. Best Practices & Action Invariants

- **Auto-Waiting**: Playwright Java auto-waits on actionability criteria before dispatching interactions. Do not use `Thread.sleep()`.
- **Avoid Force Overrides**: Do not pass `new Locator.ClickOptions().setForce(true)` unless intentionally testing obscured elements.
- **Prefer `fill()` over `type()`**: `fill()` provides atomic input clearance and entry without flaky race conditions.
