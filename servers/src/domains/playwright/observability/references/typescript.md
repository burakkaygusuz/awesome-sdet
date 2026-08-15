# Playwright Observability, Tracing & Visual Testing — TypeScript Reference

> Playwright delivers rich observability through time-travel Tracing, visual regression diffing (`toHaveScreenshot()`), failure video recordings, and step telemetry.

---

## 1. Trace Recording & Trace Viewer

Playwright Traces capture screencasts, DOM snapshots, network payloads, console logs, and action timings:

```typescript
import { test, type BrowserContext, type Page } from '@playwright/test';

test('record execution trace manually', async ({
  context,
  page,
}: {
  context: BrowserContext;
  page: Page;
}) => {
  await context.tracing.start({
    screenshots: true,
    snapshots: true,
    sources: true,
  });

  await page.goto('/dashboard');
  await page.getByRole('button', { name: 'Refresh Analytics' }).click();

  await context.tracing.stop({ path: 'test-results/traces/dashboard-trace.zip' });
});
```

### Trace Config in `playwright.config.ts`

```typescript
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

## 2. Visual Regression Testing (`toHaveScreenshot`)

```typescript
import { test, expect, type Page, type Locator } from '@playwright/test';

test('visual comparison with element masking', async ({ page }: { page: Page }) => {
  await page.goto('/dashboard');

  await expect(page).toHaveScreenshot('dashboard-home.png', {
    maxDiffPixelRatio: 0.02,
    fullPage: true,
    animations: 'disabled',
  });

  const timestamp: Locator = page.getByTestId('live-clock');
  const userAvatar: Locator = page.getByTestId('random-avatar');

  await expect(page).toHaveScreenshot('dashboard-masked.png', {
    mask: [timestamp, userAvatar],
    maskColor: '#FF00FF',
  });

  const pricingCard: Locator = page.getByTestId('enterprise-tier-card');
  await expect(pricingCard).toHaveScreenshot('pricing-card.png');
});
```

---

## 3. Test Steps & Telemetry

```typescript
import { test, expect, type Page } from '@playwright/test';

test('instrument test steps for clean reporting', async ({ page }: { page: Page }) => {
  await test.step('1. Navigate to Store Catalog', async (): Promise<void> => {
    await page.goto('/catalog');
    await expect(page.getByRole('heading', { name: 'Catalog' })).toBeVisible();
  });

  await test.step('2. Add items to shopping cart', async (): Promise<void> => {
    await page.getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page.getByTestId('cart-badge')).toHaveText('1');
  });

  await test.step('3. Complete Checkout Journey', async (): Promise<void> => {
    await page.getByRole('button', { name: 'Checkout' }).click();
    await expect(page).toHaveURL(/.*\/checkout/);
  });
});
```

---

## 4. Console & Uncaught Exception Monitoring

```typescript
import { test, expect, type Page } from '@playwright/test';

test('monitor browser console and page errors', async ({ page }: { page: Page }) => {
  const consoleErrors: string[] = [];
  const uncaughtErrors: Error[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('pageerror', (error: Error) => {
    uncaughtErrors.push(error);
  });

  await page.goto('/dashboard');

  expect(uncaughtErrors).toHaveLength(0);
});
```
