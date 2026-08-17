# Vibium Selectors & Locators — Python API Reference (Vibium 26.x+)

> Official Vibium 26.5+ Python semantic locators, open Shadow DOM piercing combinators, and scoped element queries.

---

## 1. Semantic Locator Strategies (`vibe.find`)

```python
from vibium import Element, Vibe, browserSync


def test_semantic_locators() -> None:
    vibe: Vibe = browserSync.launch()
    try:
        submit_btn: Element = vibe.find(role="button", text="Sign In")
        submit_btn.click()

        email_field: Element = vibe.find(label="Email address")
        email_field.fill("sdet@example.com")
        field_value: str = email_field.value()

        cart_badge: Element = vibe.find(testid="cart-badge")
        badge_text: str = cart_badge.text()

        search: Element = vibe.find(placeholder="Search catalog...")
        search.fill("automation")

        msg: Element = vibe.find(text="Order Confirmed")
        msg.wait_for()
    finally:
        vibe.quit()
```

---

## 2. Pierce Combinators (`>>` and `>>>`)

| Combinator | Behavior                                                                               | Example                                                                       |
| :--------- | :------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **`>>`**   | **Single Boundary Piercing** — Crosses host element shadow root or enters an iframe.   | `vibe.find("user-card >> button.edit")` / `vibe.find("iframe#auth >> input")` |
| **`>>>`**  | **Deep Shadow DOM Piercing** — Pierces across open Shadow Root boundaries recursively. | `vibe.find("custom-widget >>> internal-card >>> button.action")`              |

```python
from vibium import Element, Vibe, browserSync


def test_piercing() -> None:
    vibe: Vibe = browserSync.launch()
    try:
        edit_button: Element = vibe.find("user-card >> button.edit")
        edit_button.click()

        shadow_element: Element = vibe.find(
            "custom-widget >>> internal-card >>> button.action"
        )
        shadow_element.click()

        iframe_input: Element = vibe.find("iframe#payment-frame >> input#cvv")
        iframe_input.fill("123")
    finally:
        vibe.quit()
```

---

## 3. Subtree Scoping & Multi-Element Collections (`find`, `find_all`)

```python
from vibium import Element, Vibe, browserSync


def test_scoping() -> None:
    vibe: Vibe = browserSync.launch()
    try:
        target_row: Element = vibe.find(role="row", text="Alice")
        edit_btn: Element = target_row.find(role="button", text="Edit")
        edit_btn.click()

        all_rows: list[Element] = vibe.find_all(role="row")
        for row in all_rows:
            row_buttons: list[Element] = row.find_all("button")
    finally:
        vibe.quit()
```

---

## 4. Best Practices & Priority Hierarchy

1. **`find(role="...", text="...")` / `find(label="...")`**: User-facing accessibility contracts.
2. **`find(testid="...")`**: Dedicated QA contract (`data-testid`).
3. **`find(text="...")` / `find(placeholder="...")`**: Content matching.
4. **`>>>` Piercing / `>>` Iframe**: Complex shadow root boundaries and embedded frames.
5. Avoid raw XPath or brittle CSS paths (`div > div:nth-child(3) > span`).
