# Playwright Web-First Assertions — JavaScript Reference

> Official Playwright 1.62+ JavaScript auto-retrying web-first assertions, soft assertions, and dynamic polling.

---

## 1. Locator State Assertions

```javascript
import { test, expect } from '@playwright/test';

test('assert the state of page elements', async ({ page }) => {
  const submitButton = page.getByRole('button', { name: 'Submit Order' });

  await expect(submitButton).toBeVisible();
  await expect(submitButton).toBeEnabled();
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await expect(page.getByTestId('order-status')).toHaveText('Ready');
});
```

---

## 2. Content and Attribute Assertions

```javascript
import { test, expect } from '@playwright/test';

test('assert content and attributes', async ({ page }) => {
  await expect(page.getByRole('listitem')).toHaveCount(3);
  await expect(page.getByRole('listitem').first()).toContainText('Wireless Mouse');
  await expect(page.getByRole('link', { name: 'Account' })).toHaveAttribute('href', '/account');
  await expect(page.getByLabel('Email')).toHaveValue('user@example.com');
});
```

---

## 3. Page Assertions and Soft Assertions

```javascript
import { test, expect } from '@playwright/test';

test('assert page state and collect independent failures', async ({ page }) => {
  await expect(page).toHaveTitle(/Checkout/);
  await expect(page).toHaveURL(/\/checkout$/);
  await expect.soft(page.getByTestId('cart-badge')).toHaveText('2');
  await expect.soft(page.getByRole('heading', { name: 'Order summary' })).toBeVisible();
});
```

---

## 4. Polling Dynamic State

```javascript
import { test, expect } from '@playwright/test';

test('wait for an asynchronous API state', async () => {
  await expect
    .poll(async () => {
      const response = await fetch('https://api.example.com/jobs/42');
      const data = await response.json();
      return data.status;
    })
    .toBe('COMPLETED');
});
```

---

## 5. Best Practices & Invariants

- Use web-first assertions for browser state and `expect.poll` or `expect.toPass` for external state.
- Do not replace retrying assertions with fixed delays or sleep commands.
