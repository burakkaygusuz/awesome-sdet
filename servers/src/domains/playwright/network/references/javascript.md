# Playwright Network Mocking & API Testing — JavaScript Reference

> Official Playwright 1.62+ JavaScript network interception (page.route), HAR replay, and APIRequestContext.

---

## 1. Network Interception and Mocking

```javascript
import { test } from '@playwright/test';

test('mock API responses and block third-party traffic', async ({ page }) => {
  await page.route('**/api/v1/user/profile', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'usr_42',
        name: 'Jane Doe',
        role: 'ADMIN',
        permissions: ['READ', 'WRITE'],
      }),
    });
  });

  await page.route('**/*analytics*/**', (route) => route.abort('blockedbyclient'));
  await page.route('**/api/v1/secure/**', async (route) => {
    await route.continue({
      headers: {
        ...route.request().headers(),
        'X-Mock-Authorization': 'Bearer test-token',
      },
    });
  });

  await page.goto('/profile');
  await page.unroute('**/api/v1/user/profile');
});
```

---

## 2. HAR Replay

```javascript
import { test } from '@playwright/test';

test('replay checkout traffic from a HAR file', async ({ page }) => {
  await page.routeFromHAR('fixtures/har/checkout-flow.har', {
    url: '**/api/checkout/**',
    update: false,
    notFound: 'abort',
  });

  await page.goto('/checkout');
});
```

---

## 3. API Testing with `APIRequestContext`

```javascript
import { test, expect } from '@playwright/test';

test('verify backend state directly', async ({ playwright }) => {
  const apiContext = await playwright.request.newContext({
    baseURL: 'https://api.example.com',
    extraHTTPHeaders: {
      Accept: 'application/json',
      Authorization: 'Bearer auth-token',
    },
  });

  try {
    const createResponse = await apiContext.post('/api/v1/users', {
      data: { username: 'sdet_engineer', email: 'sdet@example.com' },
    });
    expect(createResponse.status()).toBe(201);
    const createdUser = await createResponse.json();

    const getResponse = await apiContext.get(`/api/v1/users/${createdUser.id}`);
    expect(getResponse.ok()).toBe(true);
  } finally {
    await apiContext.dispose();
  }
});
```

---

## 4. Synchronizing UI Actions with Responses

```javascript
import { test, expect } from '@playwright/test';

test('wait for the response triggered by a UI action', async ({ page }) => {
  await page.goto('/cart');
  const responsePromise = page.waitForResponse(
    (response) => response.url().includes('/api/checkout') && response.status() === 200
  );

  await page.getByRole('button', { name: 'Place Order' }).click();

  const response = await responsePromise;
  const confirmation = await response.json();
  expect(confirmation.orderId).toBeDefined();
});
```
