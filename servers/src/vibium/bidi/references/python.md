# Vibium BiDi Protocol & Network Routing — Python API Reference (Vibium 26.x+)

> Vibium (v26.5.31) leverages the W3C WebDriver BiDi standard to provide high-performance network interception, live browser event listening, and clock virtualization.

---

## 1. Network Interception (`vibe.route`)

```python
from typing import Any

def test_network_mocking(vibe: Any) -> None:
    def handle_user_api(route: Any) -> None:
        route.fulfill(
            status=200,
            content_type="application/json",
            json={"user": "Python SDET", "role": "admin"},
        )

    vibe.route("**/api/user", handle_user_api)
    vibe.route("**/*.png", lambda route: route.abort())

    vibe.go("https://app.example.com")
```

---

## 2. Event Listeners

```python
def setup_listeners(vibe: Any) -> None:
    vibe.on("console", lambda msg: print(f"Console: {msg.text}"))
    vibe.on("pageerror", lambda err: print(f"Page Error: {err}"))
```

---

## 3. Clock Virtualization

```python
def test_virtual_clock(vibe: Any) -> None:
    vibe.clock.install(time="2026-08-01T00:00:00Z")
    # Fast-forward virtual timer without real sleep delay
    vibe.clock.fast_forward(30000)
```

---

## Best Practices

- **Route Precision**: Use precise glob patterns for `vibe.route` to intercept network traffic without degrading performance.
- **Clock Virtualization**: Fast-forward timers using `vibe.clock.fast_forward()` rather than inserting `time.sleep()`.
