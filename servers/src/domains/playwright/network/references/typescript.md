# Playwright Network Mocking & API Testing — TypeScript Reference

> Official Playwright 1.62+ TypeScript network interception (page.route), HAR replay, and APIRequestContext.

---

## 1. Network Interception & Mocking (`page.route`)

```typescript
import { test, expect, type Page, type Route } from '@playwright/test';

interface UserProfile {
  id: string;
  name: string;
  role: 'ADMIN' | 'USER' | 'VIEWER';
  permissions: readonly string[];
}

test('mock API responses and abort third-party trackers', async ({ page }: { page: Page }) => {
  await page.route('**/api/v1/user/profile', async (route: Route) => {
    const mockProfile: UserProfile = {
      id: 'usr_42',
      name: 'Jane Doe',
      role: 'ADMIN',
      permissions: ['READ', 'WRITE', 'DELETE'],
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockProfile),
    });
  });

  await page.route('**/*analytics*/**', (route: Route) => route.abort('blockedbyclient'));
  await page.route('**/*.{png,jpg,jpeg,svg}', (route: Route) => route.abort());

  await page.route('**/api/v1/secure/**', async (route: Route) => {
    const headers: Record<string, string> = {
      ...route.request().headers(),
      'X-Mock-Authorization': 'Bearer test-token-123',
    };
    await route.continue({ headers });
  });

  await page.route('**/api/v1/products', async (route: Route) => {
    const response = await route.fetch();
    const json = await response.json();
    json.items.push({ id: 999, name: 'Injected Test Item', price: 0.0 });
    await route.fulfill({ response, json });
  });

  await page.unroute('**/api/v1/user/profile');
});
```

---

## 2. HAR Replay and Recording

```typescript
import { test, type Page } from '@playwright/test';

test('replay network traffic from HAR', async ({ page }: { page: Page }) => {
  await page.routeFromHAR('fixtures/har/checkout-flow.har', {
    url: '**/api/checkout/**',
    update: false,
    notFound: 'fallback',
  });

  await page.goto('/checkout');
});
```

---

## 3. Pure API Testing with `APIRequestContext`

Shift test verification left by asserting backend state directly through APIRequestContext:

```typescript
import { test, expect, type APIRequestContext, type APIResponse } from '@playwright/test';

interface CreatedUser {
  id: string;
  username: string;
  email: string;
}

test('pure API testing workflow', async ({ playwright }) => {
  const apiContext: APIRequestContext = await playwright.request.newContext({
    baseURL: 'https://api.example.com',
    extraHTTPHeaders: {
      Accept: 'application/json',
      Authorization: 'Bearer auth-token-xyz',
    },
  });

  const createRes: APIResponse = await apiContext.post('/api/v1/users', {
    data: {
      username: 'sdet_engineer',
      email: 'sdet@example.com',
    },
  });
  expect(createRes.ok()).toBeTruthy();
  expect(createRes.status()).toBe(201);
  const createdUser: CreatedUser = await createRes.json();
  expect(createdUser.id).toBeDefined();

  const getRes: APIResponse = await apiContext.get(`/api/v1/users/${createdUser.id}`);
  expect(getRes.status()).toBe(200);

  const deleteRes: APIResponse = await apiContext.delete(`/api/v1/users/${createdUser.id}`);
  expect(deleteRes.status()).toBe(204);

  await apiContext.dispose();
});
```

---

## 4. Synchronizing Actions with Network Responses

```typescript
import { test, expect, type Page, type Response } from '@playwright/test';

interface OrderConfirmation {
  orderId: string;
  status: string;
}

test('wait for specific network response triggered by UI click', async ({
  page,
}: {
  page: Page;
}) => {
  await page.goto('/cart');

  const responsePromise: Promise<Response> = page.waitForResponse(
    (response: Response) => response.url().includes('/api/checkout') && response.status() === 200
  );

  await page.getByRole('button', { name: 'Place Order' }).click();

  const response: Response = await responsePromise;
  const data: OrderConfirmation = await response.json();
  expect(data.orderId).toBeDefined();
});
```
