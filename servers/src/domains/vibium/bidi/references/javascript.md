# Vibium BiDi Protocol & Network Routing — JavaScript API Reference (Vibium 26.x+)

> Official Vibium 26.5+ JavaScript WebDriver BiDi protocol, network routing, event listeners, and clock virtualization.

---

## 1. Network Interception (`vibe.route`)

```javascript
const { browser } = require('vibium');

async function configureNetworkMocking(vibe) {
  await vibe.route('**/api/users', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: [{ id: 1, name: 'Alice' }],
    });
  });

  await vibe.route('**/*.{png,jpg,jpeg}', (route) => route.abort());
  await vibe.go('https://app.example.com');
}
```

---

## 2. BiDi Event Listeners

```javascript
function attachEventListeners(vibe) {
  vibe.on('console', (msg) => msg.text());
  vibe.on('pageerror', (err) => err.message);
}
```

---

## 3. Clock Virtualization

```javascript
async function manipulateClock(vibe) {
  await vibe.clock.install({ time: new Date('2026-01-01') });
  await vibe.clock.fastForward(5000);
}

module.exports = { configureNetworkMocking, attachEventListeners, manipulateClock };
```

---

## 4. Best Practices

- **Mock external dependencies**: Intercept unstable backend endpoints and third-party tracking scripts with `vibe.route()`.
- **Real-Time Error Observability**: Register `vibe.on('pageerror')` to catch uncaught front-end exceptions during test runs.
- **Deterministic Time Acceleration**: Use `vibe.clock.fastForward()` instead of real-time timer sleeps.
