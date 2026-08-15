# Vibium BiDi Protocol & Network Routing — Python API Reference (Vibium 26.x+)

> Vibium (v26.5.31) leverages the W3C WebDriver BiDi standard to provide high-performance network interception, live browser event listening, and clock virtualization.

---

## 1. Network Interception (`page.route`)

```python
from typing import Any
from vibium import Page


def test_network_mocking(page: Page) -> None:
    def handle_user_api(route: Any) -> None:
        route.fulfill(
            status=200,
            content_type="application/json",
            json={"user": "Python SDET", "role": "admin"},
        )

    page.route("**/api/user", handle_user_api)
    page.route("**/*.png", lambda route: route.abort())

    page.go("https://app.example.com")
```

---

## 2. Event Listeners

```python
from vibium import Page


def setup_listeners(page: Page) -> None:
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))
```

---

## 3. Clock Virtualization

```python
from vibium import Page


def test_virtual_clock(page: Page) -> None:
    page.clock.install(time="2026-08-01T00:00:00Z")
    page.clock.fast_forward(30_000)
```

---

## Best Practices

- **Route Precision**: Use precise glob patterns for `page.route` to intercept network traffic without degrading performance.
- **Clock Virtualization**: Fast-forward timers using `page.clock.fast_forward()` rather than inserting `time.sleep()`.
