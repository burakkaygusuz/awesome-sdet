# Playwright Actions & Auto-Waiting — TypeScript Reference

> Official Playwright 1.62+ TypeScript auto-waiting actions, keyboard/mouse input, and file uploads.

---

## 1. Common User Interactions

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

## 2. Drag and Drop & File Uploads

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

  await fileInput.setInputFiles({
    name: 'report.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('id,name\n1,Alpha\n2,Beta'),
  });
}
```

---

## 3. Best Practices & Action Invariants

- **Auto-Waiting**: Playwright auto-waits for target elements to be attached, visible, stable, enabled, and editable before executing actions. Never insert manual `page.waitForTimeout()`.
- **Avoid `{ force: true }`**: Bypasses actionability checks and masks real UI blockers (e.g. modals, overlays).
- **Prefer `fill()` over `type()`**: `locator.fill()` atomically clears existing text and sets the value. Use `pressSequentially()` only for real-time keypress event listener tests.
