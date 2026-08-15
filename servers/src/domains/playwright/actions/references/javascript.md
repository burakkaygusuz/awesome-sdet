# Playwright Actions & Auto-Waiting — JavaScript Reference

> Playwright performs actionability checks before each action, so tests can synchronize on the UI instead of using arbitrary sleeps.

## 1. Actionability Guarantees

Before an action runs, Playwright waits for the target to be visible, stable, enabled, and able to receive events when those checks apply. Prefer the built-in action waiters over `waitForTimeout`.

## 2. Common User Interactions

```javascript
import { test } from '@playwright/test';

test('use standard user interactions', async ({ page }) => {
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('correct-horse-battery-staple');
  await page.getByRole('checkbox', { name: 'Remember me' }).check();
  await page.getByRole('combobox', { name: 'Country' }).selectOption('TR');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('textbox', { name: 'Search' }).press('Control+A');
  await page.getByRole('textbox', { name: 'Search' }).press('Enter');
});
```

## 3. Drag and Keyboard Actions

```javascript
import { test } from '@playwright/test';

test('move an item with a pointer action', async ({ page }) => {
  const source = page.getByTestId('item-source');
  const target = page.getByTestId('drop-target');

  await source.dragTo(target);
});

test('use keyboard navigation', async ({ page }) => {
  await page.getByRole('textbox', { name: 'Search' }).pressSequentially('playwright');
  await page.keyboard.press('Enter');
});
```

## 4. Best Practices

- Let Playwright auto-wait for actionability and assertions; do not add fixed sleeps.
- Prefer `fill` for inputs and `pressSequentially` only when keyboard events are part of the behavior under test.
- Avoid `{ force: true }` unless the product intentionally requires interaction with a covered element.
