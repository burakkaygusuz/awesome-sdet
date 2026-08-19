# Playwright Storage State & Authentication — TypeScript Reference

> Official Playwright 1.62+ TypeScript authentication setup project pattern, multi-role fixtures, and storage state isolation.

---

## 1. Authentication Setup Project Pattern

Authenticate once during setup, save the session state, and inject it into dependent projects:

### A. Setup Spec (`tests/auth.setup.ts`)

```typescript
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret_pass');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
```

### B. Configuration (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

---

## 2. Multi-Role Authentication Fixtures

```typescript
import { test as base, type Page, type BrowserContext } from '@playwright/test';

type RoleFixtures = {
  adminPage: Page;
  customerPage: Page;
};

export const test = base.extend<RoleFixtures>({
  adminPage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext({
      storageState: 'playwright/.auth/admin.json',
    });
    const page: Page = await context.newPage();
    try {
      await use(page);
    } finally {
      await context.close();
    }
  },

  customerPage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext({
      storageState: 'playwright/.auth/customer.json',
    });
    const page: Page = await context.newPage();
    try {
      await use(page);
    } finally {
      await context.close();
    }
  },
});

export { expect } from '@playwright/test';
```

---

## 3. Cookie & Context Manipulation

```typescript
import { test, type BrowserContext } from '@playwright/test';

test('inject and read cookies dynamically', async ({ context }: { context: BrowserContext }) => {
  await context.addCookies([
    {
      name: 'session_id',
      value: 'token_abc123',
      domain: '.example.com',
      path: '/',
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
    },
  ]);

  const cookies = await context.cookies('https://example.com');
  console.log('Injected cookies:', cookies);

  await context.clearCookies();
});
```

---

## 4. Context Isolation Invariants

- **Isolated Browser Contexts**: Each test receives an isolated context with independent cookies, cache, and local storage.
- **Setup Project Caching**: Use setup projects for authenticating once before executing parallel spec suites.
- **Teardown Safety**: Ensure custom fixture contexts are always closed inside `finally` blocks.
