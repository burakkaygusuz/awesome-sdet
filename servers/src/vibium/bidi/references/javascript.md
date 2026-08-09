# Vibium BiDi Protocol & Network Routing — JavaScript API Reference (Vibium 26.x+)

> Vibium (v26.5.31) leverages the W3C WebDriver BiDi standard to provide high-performance network interception, live browser event listening, and clock virtualization.

---

## 1. Network Interception (`vibe.route`)

```javascript
async function configureNetworkMocking(vibe) {
  // Mock API response before network dispatch
  await vibe.route('**/api/users', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      json: [{ id: 1, name: 'Alice' }],
    });
  });

  // Block images and tracking assets
  await vibe.route('**/*.{png,jpg,jpeg}', (route) => route.abort());

  await vibe.go('https://app.example.com');
}
```

---

## 2. BiDi Event Listeners

```javascript
function attachEventListeners(vibe) {
  vibe.on('console', (msg) => console.log('[Console]:', msg.text()));
  vibe.on('pageerror', (err) => console.error('[Error]:', err.message));
}
```

---

## 3. Clock Virtualization

```javascript
async function manipulateClock(vibe) {
  await vibe.clock.install({ time: new Date('2026-01-01') });
  // Fast-forward virtual timer without real sleep delay
  await vibe.clock.fastForward(5000);
}

module.exports = { configureNetworkMocking, attachEventListeners, manipulateClock };
```
