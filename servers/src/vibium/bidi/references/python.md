# Vibium BiDi Protocol & Network Routing — Python API Reference

> Vibium (v26.5.31) leverages the W3C WebDriver BiDi standard to provide high-performance network interception, live browser event listening, and clock virtualization.

---

## 1. Network Interception (`vibe.route`)

```python
def test_network_mocking(vibe):
    def handle_user_api(route):
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
def setup_listeners(vibe):
    vibe.on("console", lambda msg: print(f"Console: {msg.text}"))
    vibe.on("pageerror", lambda err: print(f"Page Error: {err}"))
```

---

## 3. Clock Virtualization

```python
def test_virtual_clock(vibe):
    vibe.clock.install(time="2026-08-01T00:00:00Z")
    # Fast-forward virtual timer without real sleep delay
    vibe.clock.fast_forward(30000)
```
