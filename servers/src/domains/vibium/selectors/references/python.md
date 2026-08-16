# Vibium Selectors & Locators — Python API Reference (Vibium 26.x+)

> Vibium (v26.5.31) provides high-resilience semantic locators, open Shadow DOM piercing combinators (`>>`, `>>>`), and chainable locator scoping.

---

## 1. Semantic Locator Strategies (`page.find`)

```python
from vibium import browser


def test_semantic_locators() -> None:
    bro = browser.start()
    vibe = bro.page()
    submit_btn = vibe.find(role="button", text="Sign In")
    submit_btn.click()

    email_field = vibe.find(label="Email address")
    email_field.fill("sdet@example.com")

    cart_badge = vibe.find(testid="cart-badge")
    assert cart_badge.is_displayed()

    msg = vibe.find(text="Order Confirmed")
    msg.wait_for()

    search = vibe.find(placeholder="Search catalog...")
    search.fill("automation")
```

---

## 2. Pierce Combinators (`>>` and `>>>`)

```python
from vibium import browser


def test_piercing() -> None:
    bro = browser.start()
    vibe = bro.page()

    edit_button = vibe.find("user-card >> button.edit")
    edit_button.click()

    shadow_element = vibe.find("custom-widget >>> internal-card >>> button.action")
    shadow_element.click()
```

---

## 3. Subtree Scoping & Chaining

```python
from vibium import browser


def test_scoping() -> None:
    bro = browser.start()
    vibe = bro.page()
    target_row = vibe.find(role="row", text="Alice")
    edit_btn = target_row.find(role="button", text="Edit")
    edit_btn.click()
```

---

## Best Practices

- **Semantic First**: Prefer ARIA role + text attribute dictionaries (`{"role": "button", "text": "..."}`) over CSS/XPath selectors.
- **Shadow DOM Piercing**: Use `>>>` to transparently traverse nested Shadow DOM roots in modern Web Component architectures.
