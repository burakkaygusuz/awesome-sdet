# Playwright Storage State & Authentication — JavaScript Reference

> Playwright speeds up isolated tests by reusing saved authentication state with `storageState` and by creating a fresh `BrowserContext` for each test.

## 1. Authentication Setup Project Pattern

Authenticate once during setup, save the session state, and inject it into dependent projects:

```javascript
// auth.setup.js
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

### Configure in `playwright.config.js`

```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.js/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});
```

## 2. Multi-Role Authentication Fixtures

```javascript
import { test as base, expect } from '@playwright/test';

export const test = base.extend({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'playwright/.auth/admin.json' });
    try {
      await use(await context.newPage());
    } finally {
      await context.close();
    }
  },
});

export { expect };
```

## 3. Cookie and Context Manipulation

```javascript
import { test } from '@playwright/test';

test('inspect and manipulate isolated cookies', async ({ context }) => {
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

  console.log('Active cookies:', await context.cookies('https://example.com'));
  await context.clearCookies();
});
```

## 4. Context Isolation Invariants

- Each test receives an isolated context with independent cookies, cache, and local storage.
- Seed authentication state instead of repeating UI login in every scenario.
- Close manually created contexts in a `finally` block; standard fixtures clean up automatically.
