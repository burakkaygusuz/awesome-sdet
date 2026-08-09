# Vibium Selectors & Locators — Python API Reference

> Vibium (v26.5.31) provides high-resilience semantic locators, open Shadow DOM piercing combinators (`>>`, `>>>`), and chainable locator scoping.

---

## 1. Semantic Locator Strategies (`vibe.find`)

```python
def test_semantic_locators(vibe):
    submit_btn = vibe.find({"role": "button", "text": "Sign In"})
    submit_btn.click()

    email_field = vibe.find("label=Email address")
    email_field.fill("sdet@example.com")

    cart_badge = vibe.find("testid=cart-badge")
    assert cart_badge.is_displayed()

    msg = vibe.find("text=Order Confirmed")
    msg.wait_for()

    search = vibe.find("placeholder=Search catalog...")
    search.fill("automation")
```

---

## 2. Pierce Combinators (`>>` and `>>>`)

```python
def test_piercing(vibe):
    form_btn = vibe.find("form.login-form >> button[type='submit']")
    form_btn.click()

    # '>>>' pierces nested Web Components across open Shadow Root boundaries
    shadow_element = vibe.find("custom-widget >>> internal-card >>> button.action")
    shadow_element.click()
```

---

## 3. Subtree Scoping & Chaining

```python
def test_scoping(vibe):
    target_row = vibe.find({"role": "row", "text": "Alice"})
    edit_btn = target_row.find({"role": "button", "text": "Edit"})
    edit_btn.click()
```
