# Vibium Interactions & Actionability — Python API Reference (Vibium 26.x+)

> Official Vibium 26.5+ Python auto-waiting interaction primitives, actionability checks, and pointer mechanics.

---

## 1. Interaction Methods

```python
from typing import Any
from vibium import Element, Vibe


def test_interactions(vibe: Vibe) -> None:
    btn: Element = vibe.find(role="button", text="Log In")
    btn.click()

    username: Element = vibe.find(label="Username")
    username.fill("admin")
    username.type("_dev")
    username.press("Enter")
    print("Username input value:", username.value())

    country_select: Element = vibe.find(role="combobox", text="Country")
    country_select.select("US")

    terms: Element = vibe.find(label="Agree to Terms")
    terms.check()
    terms.uncheck()

    menu: Element = vibe.find(testid="profile-menu")
    menu.hover()
    menu.highlight()
    box: dict[str, Any] = menu.bounds()
    print("Bounding box:", box)
    print("Menu text content:", menu.text())

    source: Element = vibe.find(testid="task-1")
    target: Element = vibe.find(testid="column-done")
    source.drag_to(target)
```

---

## 2. Best Practices & Action Invariants

- **Use `fill()` for Form Inputs**: `fill()` atomically sets field values and triggers change events; use `type()` only for real-time keypress validation testing.
- **Actionability Auto-Waiting**: Vibium auto-waits for elements to become attached, visible, stable, enabled, and non-obscured before interacting. Avoid manual delays (`time.sleep()`).
- **Autonomous Intent Verification**: Combine `vibe.do("click submit")` and `vibe.check("verify status")` when driving autonomous agent steps.
