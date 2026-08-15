# Vibium Selectors & Locators — Python API Reference (Vibium 26.x+)

> Vibium (v26.5.31) provides high-resilience semantic locators, open Shadow DOM piercing combinators (`>>`, `>>>`), and chainable locator scoping.

---

## 1. Semantic Locator Strategies (`page.find`)

```python
from vibium import Element, Page


def test_semantic_locators(page: Page) -> None:
    submit_btn: Element = page.find({"role": "button", "text": "Sign In"})
    submit_btn.click()

    email_field: Element = page.find("label=Email address")
    email_field.fill("sdet@example.com")

    cart_badge: Element = page.find("testid=cart-badge")
    assert cart_badge.is_displayed()

    msg: Element = page.find("text=Order Confirmed")
    msg.wait_for()

    search: Element = page.find("placeholder=Search catalog...")
    search.fill("automation")
```

---

## 2. Pierce Combinators (`>>` and `>>>`)

```python
from vibium import Element, Page


def test_piercing(page: Page) -> None:
    form_btn: Element = page.find("form.login-form >> button[type='submit']")
    form_btn.click()

    shadow_element: Element = page.find(
        "custom-widget >>> internal-card >>> button.action"
    )
    shadow_element.click()
```

---

## 3. Subtree Scoping & Chaining

```python
from vibium import Element, Page


def test_scoping(page: Page) -> None:
    target_row: Element = page.find({"role": "row", "text": "Alice"})
    edit_btn: Element = target_row.find({"role": "button", "text": "Edit"})
    edit_btn.click()
```

---

## Best Practices

- **Semantic First**: Prefer ARIA role + text attribute dictionaries (`{"role": "button", "text": "..."}`) over CSS/XPath selectors.
- **Shadow DOM Piercing**: Use `>>>` to transparently traverse nested Shadow DOM roots in modern Web Component architectures.
