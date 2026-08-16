# Vibium Interactions & Actionability — Python API Reference (Vibium 26.x+)

> Vibium (v26.5.31) automatically performs comprehensive actionability checks before executing any interaction, preventing race conditions and test flakiness.

---

## 1. Interaction Primitives

```python
from typing import Any
from vibium import Element, Page


def test_interactions(page: Page) -> None:
    btn: Element = page.find(role="button", text="Log In")
    btn.click()

    username: Element = page.find("label=Username")
    username.fill("admin")
    username.type("_dev")
    username.press("Enter")

    terms: Element = page.find("label=Agree")
    terms.check()
    terms.uncheck()

    menu: Element = page.find("testid=profile-menu")
    menu.hover()
    menu.highlight()
    box: dict[str, Any] = menu.bounds()
    print("Bounding box:", box)

    source: Element = page.find("testid=task-1")
    target: Element = page.find("testid=column-done")
    source.drag_to(target)
```

---

## Best Practices

- **Use `fill()` for Form Inputs**: `fill()` atomically sets field values and triggers change events; use `type()` only for real-time keypress validation testing.
- **Actionability Checks**: Vibium auto-waits for elements to become visible, stable, and enabled before interacting. Avoid manual delays.
