# Playwright Observability, Tracing & Visual Testing — JavaScript Reference

> Official Playwright 1.62+ JavaScript execution tracing, visual regression comparisons, test steps, and error monitoring.

---

## 1. Trace Recording and Trace Viewer

```javascript
import { test } from '@playwright/test';

test('record an execution trace', async ({ context, page }) => {
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });

  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Refresh Analytics' }).click();

  await context.tracing.stop({ path: 'test-results/traces/dashboard-trace.zip' });
});
```

### Trace Configuration in `playwright.config.js`

```javascript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
});
```

---

## 2. Visual Regression Testing

```javascript
import { test, expect } from '@playwright/test';

test('compare a stable page screenshot', async ({ page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveScreenshot('dashboard-home.png', {
    maxDiffPixelRatio: 0.02,
    fullPage: true,
    animations: 'disabled',
  });

  await expect(page.getByTestId('pricing-card')).toHaveScreenshot('pricing-card.png');
});
```

---

## 3. Test Steps and Telemetry

```javascript
import { test, expect } from '@playwright/test';

test('group workflow actions into reportable steps', async ({ page }) => {
  await test.step('Navigate to the catalog', async () => {
    await page.goto('/catalog');
    await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible();
  });

  await test.step('Add an item to the cart', async () => {
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page.getByTestId('cart-badge')).toHaveText('1');
  });
});
```

---

## 4. Console and Uncaught Exception Monitoring

```javascript
import { test, expect } from '@playwright/test';

test('capture browser errors as test evidence', async ({ page }) => {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/dashboard');

  expect(consoleErrors).toEqual([]);
  expect(pageErrors).toEqual([]);
});
```
