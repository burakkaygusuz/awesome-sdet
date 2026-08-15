# Playwright Actions & Auto-Waiting — TypeScript Reference

> Playwright performs thorough actionability checks before performing any action (e.g. click, fill), eliminating the need for manual sleeps or arbitrary wait loops.

---

## 1. Actionability Guarantees

Before executing an action, Playwright auto-waits for the target element to pass all relevant actionability checks:

| Action               | Attached | Visible | Stable | Receives Events | Enabled | Editable |
| :------------------- | :------: | :-----: | :----: | :-------------: | :-----: | :------: |
| **`click()`**        |    ✅    |   ✅    |   ✅   |       ✅        |   ✅    |    —     |
| **`fill()`**         |    ✅    |   ✅    |   ✅   |       ✅        |   ✅    |    ✅    |
| **`check()`**        |    ✅    |   ✅    |   ✅   |       ✅        |   ✅    |    —     |
| **`selectOption()`** |    ✅    |   ✅    |   ✅   |       ✅        |   ✅    |    —     |
| **`hover()`**        |    ✅    |   ✅    |   ✅   |       ✅        |    —    |    —     |

---

## 2. Common User Interactions

```typescript
import { test, type Page, type Locator } from '@playwright/test';

test('demonstrate standard actions', async ({ page }: { page: Page }) => {
  const submitBtn: Locator = page.getByRole('button', { name: 'Submit' });
  const emailInput: Locator = page.getByLabel('Email Address');
  const roleSelect: Locator = page.getByRole('combobox', { name: 'Role' });
  const newsletterCheck: Locator = page.getByRole('checkbox', { name: 'Subscribe' });

  await submitBtn.click();
  await submitBtn.dblclick();
  await submitBtn.click({ button: 'right' });
  await submitBtn.click({ modifiers: ['Control', 'Shift'] });

  await emailInput.fill('user@example.com');
  await emailInput.pressSequentially('user@example.com', { delay: 50 });

  await emailInput.press('Enter');
  await emailInput.press('Control+A');
  await page.keyboard.press('Escape');

  await newsletterCheck.check();
  await newsletterCheck.uncheck();
  await newsletterCheck.setChecked(true);

  await roleSelect.selectOption('ADMIN');
  await roleSelect.selectOption({ label: 'Engineering Manager' });
  await roleSelect.selectOption({ index: 2 });

  await page.getByRole('menuitem', { name: 'Settings' }).hover();
  await emailInput.focus();
  await emailInput.blur();
});
```

---

## 3. Drag and Drop & File Uploads

```typescript
import { type Page, type Locator } from '@playwright/test';

export async function advancedActions(page: Page): Promise<void> {
  const source: Locator = page.getByTestId('draggable-item');
  const target: Locator = page.getByTestId('drop-target-zone');
  await source.dragTo(target);

  const fileInput: Locator = page.getByLabel('Upload Resume');
  await fileInput.setInputFiles('fixtures/resume.pdf');
  await fileInput.setInputFiles(['fixtures/doc1.pdf', 'fixtures/doc2.pdf']);
  await fileInput.setInputFiles([]);

  // In-memory buffer file upload
  await fileInput.setInputFiles({
    name: 'report.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('id,name\n1,Alpha\n2,Beta'),
  });
}
```

---

## 4. Best Practices & Action Invariants

1. ⚡ **Rely on Auto-Waiting:** Never add arbitrary sleeps (`await page.waitForTimeout(3000)` is strictly discouraged).
2. 🔒 **Avoid `force: true`:** Using `{ force: true }` bypasses actionability checks and can trigger flaky tests where the UI was not actually ready.
3. 📝 **Use `fill()` over `type()`:** `locator.fill()` is deterministic, clears existing values, and triggers input/change events. Use `pressSequentially()` only when testing keydown/keyup event listeners.
