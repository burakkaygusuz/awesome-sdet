# Vibium BiDi Protocol & Network Routing — TypeScript API Reference (Vibium 26.x+)

> Official Vibium 26.5+ TypeScript WebDriver BiDi protocol, network routing, event listeners, and clock virtualization.

---

## 1. Network Interception & Mocking (`vibe.route`)

```typescript
import { type Vibe, type Route } from 'vibium';

export async function demonstrateNetworkMocking(vibe: Vibe): Promise<void> {
  await vibe.route('**/api/v1/profile', async (route: Route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: {
        id: 'usr_42',
        username: 'sdet-specialist',
        roles: ['ADMIN', 'AUTOMATION_LEAD'],
      },
    });
  });

  await vibe.route('**/*{google-analytics,segment,doubleclick}*', (route: Route) => {
    route.abort('blockedbyclient');
  });

  await vibe.route('**/api/**', async (route: Route) => {
    const headers = {
      ...route.request().headers(),
      'X-Mock-Environment': 'staging-e2e',
    };
    await route.continue({ headers });
  });

  await vibe.go('https://app.example.com/profile');
}
```

---

## 2. Real-Time BiDi Event Listeners

```typescript
import { type Vibe } from 'vibium';

export async function setupBiDiEventListeners(vibe: Vibe): Promise<void> {
  vibe.on('console', (msg) => {
    console.log(`[Browser Console ${msg.type()}]: ${msg.text()}`);
  });

  vibe.on('pageerror', (error: Error) => {
    console.error(`[Unhandled Browser Exception]: ${error.message}`);
  });

  vibe.on('dialog', async (dialog) => {
    await dialog.accept();
  });
}
```

---

## 3. Clock Virtualization & Time Manipulation

Fast-forward timers without arbitrary `sleep()` intervals:

```typescript
import { type Vibe } from 'vibium';

export async function virtualizeClock(vibe: Vibe): Promise<void> {
  await vibe.clock.install({
    time: new Date('2026-08-01T12:00:00.000Z'),
  });

  await vibe.go('https://app.example.com/countdown');
  await vibe.clock.fastForward(10 * 60 * 1000);

  const expiredMsg = await vibe.find({ text: 'Offer Expired' });
  await expiredMsg.waitFor();
}
```

---

## 4. Best Practices

- **Mock external dependencies**: Isolate E2E tests from flaky third-party APIs by fulfilling responses via `vibe.route()`.
- **Fail tests on unhandled page errors**: Attach a `vibe.on('pageerror')` listener to fail CI tests immediately if client-side JS crashes.
- **Use clock virtualization for timeouts**: Avoid waiting real-time minutes for expiration or auto-save intervals.
