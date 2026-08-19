# Playwright Locators & Selectors — JavaScript Reference

> Official Playwright 1.62+ JavaScript locator strategies, accessibility queries, filtering, and chaining.

---

## 1. Recommended User-Facing Locators

Prefer accessibility semantics and user-facing contracts over brittle CSS or XPath selectors:

```javascript
import { test } from '@playwright/test';

test('locate elements through user-facing contracts', async ({ page }) => {
  const submitButton = page.getByRole('button', { name: 'Submit Order' });
  const navigationHeading = page.getByRole('heading', { name: 'Dashboard', level: 1 });
  const termsCheckbox = page.getByRole('checkbox', { name: 'I agree to Terms' });
  const countrySelect = page.getByRole('combobox', { name: 'Country' });
  const usernameInput = page.getByLabel('Username or Email');
  const searchInput = page.getByPlaceholder('Search products, categories...');
  const welcomeText = page.getByText('Welcome back, Admin!');
  const companyLogo = page.getByAltText('Acme Corporation');
  const closeButton = page.getByTitle('Close modal');
  const dataCard = page.getByTestId('user-summary-card');

  await submitButton.click();
  await navigationHeading.waitFor();
  await termsCheckbox.check();
  await countrySelect.selectOption('US');
  await usernameInput.fill('jane@example.com');
  await searchInput.fill('mouse');
  await welcomeText.waitFor();
  await companyLogo.waitFor();
  await closeButton.waitFor();
  await dataCard.waitFor();
});
```

---

## 2. Locator Filtering and Chaining

```javascript
import { test } from '@playwright/test';

test('filter and chain locators', async ({ page }) => {
  const productRow = page.getByRole('listitem').filter({ hasText: 'Wireless Mouse' });
  await productRow.getByRole('button', { name: 'Add to Cart' }).click();

  const activeUserRow = page.getByRole('row').filter({
    has: page.getByRole('status', { name: 'Active' }),
  });
  await activeUserRow.getByRole('button', { name: 'View' }).click();

  const pendingItems = page.getByRole('row').filter({
    hasNot: page.getByText('Completed'),
  });

  const visibleSubmitButtons = page.locator('button:visible');

  const modal = page.getByRole('dialog', { name: 'Edit Profile' });
  await modal.getByRole('textbox', { name: 'Full Name' }).fill('Jane Doe');
  await modal.getByRole('button', { name: 'Save' }).click();
});
```

---

## 3. Lists and Multi-Element Operations

```javascript
import { test, expect } from '@playwright/test';

test('work with a list of elements', async ({ page }) => {
  const items = page.getByRole('listitem');

  await expect(items).toHaveCount(5);
  await expect(items.first()).toContainText('First item');
  await expect(items.nth(2)).toBeVisible();

  for (const item of await items.all()) {
    console.log(`Found item: ${(await item.textContent()) ?? 'unknown'}`);
  }
});
```

---

## 4. Locator Priority Hierarchy

| Priority | Locator strategy                 | Best practice                              |
| :------- | :------------------------------- | :----------------------------------------- |
| 1        | `page.getByRole(role, { name })` | Matches accessibility semantics.           |
| 2        | `page.getByLabel('Text')`        | Targets labelled form controls.            |
| 3        | `page.getByPlaceholder('Text')`  | Useful for inputs without explicit labels. |
| 4        | `page.getByTestId('id')`         | Uses a dedicated stable test contract.     |
| 5        | `page.getByText('Text')`         | Targets non-interactive visible text.      |
| Avoid    | XPath or CSS hierarchies         | Brittle under DOM and styling changes.     |
