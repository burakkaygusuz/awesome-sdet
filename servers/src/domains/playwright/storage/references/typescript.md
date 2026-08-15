# Playwright Storage State & Authentication — TypeScript Reference

> Playwright accelerates test execution by reusing saved authentication states (`storageState`) and providing isolated `BrowserContext` fixtures.

---

## 1. Authentication Setup Project Pattern

Authenticate once during setup, store session cookies/storage to disk, and inject into dependent test projects:

```typescript
// auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Username').fill('standard_user');
  await page.getByLabel('Password').fill('secret_pass');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.context().storageState({ path: authFile });
});
```

### Configure in `playwright.config.ts`

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
    await use(page);
    await context.close();
  },

  customerPage: async ({ browser }, use) => {
    const context: BrowserContext = await browser.newContext({
      storageState: 'playwright/.auth/customer.json',
    });
    const page: Page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';
```

---

## 3. Cookie & Context Manipulation

```typescript
import { test, type BrowserContext } from '@playwright/test';

test('inspect and manipulate cookies and context', async ({
  context,
}: {
  context: BrowserContext;
}) => {
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
  console.log('Active cookies:', cookies);

  await context.clearCookies();
});
```

---

## 4. Context Isolation & Invariants

1. 🛡️ **Zero Cross-Test Contamination:** Each test gets a fresh, isolated `BrowserContext` with independent cookies, cache, and localStorage.
2. 🚀 **Eliminate UI Login Repetition:** Never log in through the UI before every single test scenario. Seed auth state or storage state.
3. 🧹 **Automatic Teardown:** Standard Playwright fixtures automatically close browser contexts and dispose of temp state.
