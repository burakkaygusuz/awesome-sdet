# Playwright Web-First Assertions — TypeScript Reference

> Playwright Web-First Assertions automatically poll and retry until the expected condition is met or the assertion timeout expires.

---

## 1. Locator State Assertions

```typescript
import { test, expect, type Page, type Locator } from '@playwright/test';

test('demonstrate locator state assertions', async ({ page }: { page: Page }) => {
  const submitBtn: Locator = page.getByRole('button', { name: 'Submit' });
  const termsCheckbox: Locator = page.getByRole('checkbox', { name: 'Terms' });
  const searchInput: Locator = page.getByPlaceholder('Search');
  const alertBanner: Locator = page.getByRole('alert');

  await expect(submitBtn).toBeVisible();
  await expect(alertBanner).toBeHidden();
  await expect(alertBanner).toBeAttached();

  await expect(submitBtn).toBeEnabled();
  await expect(submitBtn).not.toBeDisabled();
  await expect(searchInput).toBeEditable();
  await expect(searchInput).toBeFocused();

  await expect(termsCheckbox).toBeChecked();
  await expect(searchInput).toBeEmpty();
});
```

---

## 2. Content & Attribute Assertions

```typescript
import { test, expect, type Page, type Locator } from '@playwright/test';

test('demonstrate content and attribute assertions', async ({ page }: { page: Page }) => {
  const header: Locator = page.getByRole('heading', { level: 1 });
  const items: Locator = page.getByRole('listitem');
  const userCard: Locator = page.getByTestId('user-profile');
  const input: Locator = page.getByLabel('User Email');

  await expect(header).toHaveText('Welcome to Dashboard');
  await expect(header).toHaveText(/welcome to/i);
  await expect(header).toContainText('Dashboard');

  await expect(userCard).toHaveAttribute('data-status', 'active');
  await expect(userCard).toHaveClass(/card-highlighted/);
  await expect(userCard).toHaveId('user-42');

  await expect(input).toHaveValue('admin@example.com');
  await expect(items).toHaveCount(5);
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

  expect.soft(page.getByRole('banner')).toBeVisible();
  expect.soft(page.getByRole('navigation')).toBeVisible();
  expect.soft(page.getByRole('contentinfo')).toBeVisible();

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
