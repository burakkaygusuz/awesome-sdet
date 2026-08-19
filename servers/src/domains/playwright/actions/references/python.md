# Playwright Actions & Auto-Waiting — Python Reference

> Official Playwright 1.62+ Python auto-waiting actions, keyboard/mouse input, and file uploads.

---

## 1. Common User Interactions

```python
from playwright.sync_api import Locator, Page


def demonstrate_actions(page: Page) -> None:
    submit_btn: Locator = page.get_by_role("button", name="Submit")
    email_input: Locator = page.get_by_label("Email Address")
    role_select: Locator = page.get_by_role("combobox", name="Role")
    newsletter_check: Locator = page.get_by_role("checkbox", name="Subscribe")

    submit_btn.click()
    submit_btn.dblclick()
    submit_btn.click(button="right")
    submit_btn.click(modifiers=["Control", "Shift"])

    email_input.fill("user@example.com")
    email_input.press_sequentially("user@example.com", delay=50)

    email_input.press("Enter")
    email_input.press("Control+A")
    page.keyboard.press("Escape")

    newsletter_check.check()
    newsletter_check.uncheck()
    newsletter_check.set_checked(True)

    role_select.select_option("ADMIN")
    role_select.select_option(label="Engineering Manager")
    role_select.select_option(index=2)

    page.get_by_role("menuitem", name="Settings").hover()
    email_input.focus()
    email_input.blur()
```

---

## 2. Drag and Drop & File Uploads with `pathlib`

```python
from pathlib import Path
from playwright.sync_api import FilePayload, Locator, Page


def advanced_actions(page: Page) -> None:
    source: Locator = page.get_by_test_id("draggable-item")
    target: Locator = page.get_by_test_id("drop-target-zone")
    source.drag_to(target)

    fixtures_dir = Path(__file__).parent / "fixtures"
    file_input: Locator = page.get_by_label("Upload Resume")
    file_input.set_input_files(fixtures_dir / "resume.pdf")

    file_input.set_input_files(
        [fixtures_dir / "doc1.pdf", fixtures_dir / "doc2.pdf"]
    )

    file_input.set_input_files(
        FilePayload(
            name="report.csv",
            mimeType="text/csv",
            buffer=b"id,name\n1,Alpha\n2,Beta",
        )
    )
```

---

## 3. Best Practices & Action Invariants

- **Auto-Waiting**: Playwright auto-waits for elements to be attached, visible, stable, enabled, and editable. Avoid `time.sleep()`.
- **Avoid `{ force: True }`**: Bypasses actionability checks and risks masked element flakiness.
- **Prefer `fill()` over `type()`**: `fill()` atomically clears and writes input values. Use `press_sequentially()` only when testing keydown/keyup event handlers.
