# Playwright Locators & Selectors — TypeScript Reference

> Official Playwright 1.62+ TypeScript locator strategies, accessibility queries, filtering, and chaining.

---

## 1. Recommended User-Facing Locators

Always prioritize accessibility roles and user-facing contracts over brittle CSS or XPath selectors:

```typescript
import { test, expect, type Page, type Locator } from '@playwright/test';

test('demonstrate recommended locators', async ({ page }: { page: Page }) => {
  const submitButton: Locator = page.getByRole('button', { name: 'Submit Order' });
  const navigationHeading: Locator = page.getByRole('heading', { name: 'Dashboard', level: 1 });
  const termsCheckbox: Locator = page.getByRole('checkbox', { name: 'I agree to Terms' });
  const countrySelect: Locator = page.getByRole('combobox', { name: 'Country' });

  const usernameInput: Locator = page.getByLabel('Username or Email');
  const passwordInput: Locator = page.getByLabel('Password');

  const searchInput: Locator = page.getByPlaceholder('Search products, categories...');

  const welcomeText: Locator = page.getByText('Welcome back, Admin!');
  const exactMatch: Locator = page.getByText('Active', { exact: true });

  const companyLogo: Locator = page.getByAltText('Acme Corporation');
  const closeIcon: Locator = page.getByTitle('Close modal');
  const dataCard: Locator = page.getByTestId('user-summary-card');
});
```

---

## 2. Locator Filtering & Chaining

```typescript
import { type Page, type Locator } from '@playwright/test';

export async function filterAndChain(page: Page): Promise<void> {
  const productRow: Locator = page.getByRole('listitem').filter({ hasText: 'Wireless Mouse' });
  await productRow.getByRole('button', { name: 'Add to Cart' }).click();

  const activeUserRow: Locator = page.getByRole('row').filter({
    has: page.getByRole('status', { name: 'Active' }),
  });

  const pendingOrders: Locator = page.getByRole('row').filter({
    hasNot: page.getByText('Completed'),
  });

  const visibleSubmitButtons: Locator = page.locator('button:visible');

  const modal: Locator = page.getByRole('dialog', { name: 'Edit Profile' });
  await modal.getByRole('textbox', { name: 'Full Name' }).fill('Jane Doe');
  await modal.getByRole('button', { name: 'Save' }).click();
}
```

---

## 3. Lists & Multi-Element Operations

```typescript
import { expect, type Page, type Locator } from '@playwright/test';

export async function handleElementLists(page: Page): Promise<void> {
  const items: Locator = page.getByRole('listitem');

  await expect(items).toHaveCount(5);

  const firstItem: Locator = items.first();
  const lastItem: Locator = items.last();
  const thirdItem: Locator = items.nth(2);

  const elements: readonly Locator[] = await items.all();
  for (const item of elements) {
    const text: string | null = await item.textContent();
    console.log(`Found item: ${text ?? 'unknown'}`);
  }
}
```

---

## 4. Locator Priority Hierarchy

| Priority         | Locator Strategy                 | Best Practice                                          |
| :--------------- | :------------------------------- | :----------------------------------------------------- |
| 1 **1**          | `page.getByRole(role, { name })` | Matches user accessibility semantics (ARIA).           |
| 2 **2**          | `page.getByLabel('Text')`        | Form control inputs paired with labels.                |
| 3 **3**          | `page.getByPlaceholder('Text')`  | Search or input fields lacking explicit labels.        |
| 4 **4**          | `page.getByTestId('id')`         | Dedicated test attributes (`data-testid`).             |
| 4 **5**          | `page.getByText('Text')`         | Non-interactive text assertions.                       |
| [warn] **Avoid** | XPath / CSS hierarchies          | Brittle against DOM restructuring and styling changes. |
