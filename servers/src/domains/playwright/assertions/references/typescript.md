# Playwright Web-First Assertions — TypeScript Reference

> Official Playwright 1.62+ TypeScript auto-retrying web-first assertions, soft assertions, and polling loops.

---

## 1. Locator State Assertions

```typescript
import { test, expect, type Page, type Locator } from '@playwright/test';

test('demonstrate locator state assertions', async ({ page }: { page: Page }) => {
  const submitBtn: Locator = page.getByRole('button', { name: 'Submit' });
  const termsCheckbox: Locator = page.getByRole('checkbox', { name: 'Terms' });
  const searchInput: Locator = page.getByPlaceholder('Search');

  await expect(submitBtn).toBeVisible();
  await expect(submitBtn).toBeEnabled();
  await expect(submitBtn).not.toBeDisabled();

  await expect(termsCheckbox).toBeChecked();
  await expect(searchInput).toBeFocused();
  await expect(page.getByTestId('loading-spinner')).toBeHidden();
  await expect(page.getByTestId('error-alert')).not.toBeVisible();
});
```

---

## 2. Text, Value, Count & Attribute Assertions

```typescript
import { test, expect, type Page, type Locator } from '@playwright/test';

test('demonstrate text, attribute and count assertions', async ({ page }: { page: Page }) => {
  const statusBadge: Locator = page.getByTestId('user-status');
  const userEmailInput: Locator = page.getByLabel('Email');
  const productRows: Locator = page.getByRole('row');

  await expect(statusBadge).toHaveText('Active');
  await expect(statusBadge).toHaveText(/active/i);
  await expect(statusBadge).toContainText('Act');

  await expect(userEmailInput).toHaveValue('admin@example.com');
  await expect(userEmailInput).toHaveAttribute('type', 'email');
  await expect(statusBadge).toHaveClass(/(^|\s)badge-success(\s|$)/);

  await expect(productRows).toHaveCount(10);
});
```

---

## 3. Page Assertions & Soft Assertions

```typescript
import { test, expect, type Page } from '@playwright/test';

test('demonstrate page & soft assertions', async ({ page }: { page: Page }) => {
  await expect(page).toHaveURL('https://example.com/dashboard');
  await expect(page).toHaveURL(/.*\/dashboard/);
  await expect(page).toHaveTitle('Enterprise SDET Dashboard');

  await expect.soft(page.getByRole('banner')).toBeVisible();
  await expect.soft(page.getByRole('navigation')).toBeVisible();
  await expect.soft(page.getByRole('contentinfo')).toBeVisible();

  await expect(
    page.getByTestId('sync-complete'),
    'Sync banner should appear within 10s'
  ).toBeVisible({
    timeout: 10_000,
  });
});
```

---

## 4. Polling & Dynamic Retry Loops (`expect.poll` and `expect.toPass`)

```typescript
import { test, expect } from '@playwright/test';

test('demonstrate dynamic polling', async () => {
  interface JobStatusResponse {
    status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  }

  await expect
    .poll(
      async (): Promise<string> => {
        const res: Response = await fetch('https://api.example.com/jobs/123/status');
        const data: JobStatusResponse = await res.json();
        return data.status;
      },
      {
        message: 'Job status did not become COMPLETED in time',
        timeout: 15_000,
        intervals: [1_000, 2_000],
      }
    )
    .toBe('COMPLETED');

  interface DataResponse {
    items: readonly unknown[];
  }

  await expect(async (): Promise<void> => {
    const res: Response = await fetch('https://api.example.com/data');
    expect(res.status).toBe(200);
    const body: DataResponse = await res.json();
    expect(body.items.length).toBeGreaterThan(0);
  }).toPass({
    timeout: 10_000,
    intervals: [1_000],
  });
});
```
