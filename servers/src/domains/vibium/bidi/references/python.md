# Vibium BiDi Protocol & Network Routing — Python API Reference (Vibium 26.x+)

> Official Vibium 26.5+ Python WebDriver BiDi protocol, network routing, event listeners, and clock virtualization.

---

## 1. Network Interception (`vibe.route`)

```python
from typing import Any
from vibium import Vibe


def test_network_mocking(vibe: Vibe) -> None:
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
from vibium import Vibe


def setup_listeners(vibe: Vibe) -> None:
    vibe.on("console", lambda msg: print(f"Console: {msg.text}"))
    vibe.on("pageerror", lambda err: print(f"Page Error: {err}"))
```

---

## 3. Clock Virtualization

```python
from vibium import Vibe


def test_virtual_clock(vibe: Vibe) -> None:
    vibe.clock.install(time="2026-08-01T00:00:00Z")
    vibe.clock.fast_forward(30_000)
```

---

## 4. Best Practices

- **Route Precision**: Use precise glob patterns for `vibe.route` to intercept network traffic without degrading performance.
- **Clock Virtualization**: Fast-forward timers using `vibe.clock.fast_forward()` rather than inserting `time.sleep()`.
- **Observability**: Subscribe to `console` and `pageerror` BiDi events for instant failure detection on client exceptions.
