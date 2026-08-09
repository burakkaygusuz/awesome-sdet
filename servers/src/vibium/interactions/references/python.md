# Vibium Interactions & Actionability — Python API Reference

> Vibium (v26.5.31) automatically performs comprehensive actionability checks before executing any interaction, preventing race conditions and test flakiness.

---

## 1. Interaction Primitives

```python
def test_interactions(vibe):
    btn = vibe.find({"role": "button", "text": "Log In"})
    btn.click()

    # fill(): atomic value replacement; type(): sequential keystrokes
    username = vibe.find("label=Username")
    username.fill("admin")
    username.type("_dev")

    username.press("Enter")

    # Idempotent checkbox state toggles
    terms = vibe.find("label=Agree")
    terms.check()
    terms.uncheck()

    menu = vibe.find("testid=profile-menu")
    menu.hover()
    menu.highlight()
    box = menu.bounds()
    print("Bounding box:", box)

    source = vibe.find("testid=task-1")
    target = vibe.find("testid=column-done")
    source.drag_to(target)
```
