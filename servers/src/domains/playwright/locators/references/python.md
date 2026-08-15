# Playwright Locators & Selectors — Python Reference

> Playwright Python locators represent an element query on the page, dynamically evaluated and auto-waited upon action execution.

---

## 1. Recommended User-Facing Locators

```python
from playwright.sync_api import Locator, Page


def demonstrate_locators(page: Page) -> None:
    submit_btn: Locator = page.get_by_role("button", name="Submit Order")
    heading: Locator = page.get_by_role("heading", name="Dashboard", level=1)
    terms_box: Locator = page.get_by_role("checkbox", name="I agree to Terms")
    country_select: Locator = page.get_by_role("combobox", name="Country")

    username_input: Locator = page.get_by_label("Username or Email")
    password_input: Locator = page.get_by_label("Password")

    search_field: Locator = page.get_by_placeholder("Search products, categories...")

    welcome_text: Locator = page.get_by_text("Welcome back, Admin!")
    exact_text: Locator = page.get_by_text("Active", exact=True)

    logo: Locator = page.get_by_alt_text("Acme Corporation")
    close_btn: Locator = page.get_by_title("Close modal")
    card: Locator = page.get_by_test_id("user-summary-card")
```

---

## 2. Locator Filtering & Chaining

```python
from playwright.sync_api import Locator, Page


def filter_and_chain(page: Page) -> None:
    row: Locator = page.get_by_role("listitem").filter(has_text="Wireless Mouse")
    row.get_by_role("button", name="Add to Cart").click()

    active_user: Locator = page.get_by_role("row").filter(
        has=page.get_by_role("status", name="Active")
    )

    pending_items: Locator = page.get_by_role("row").filter(
        has_not=page.get_by_text("Completed")
    )

    dialog: Locator = page.get_by_role("dialog", name="Edit Profile")
    dialog.get_by_role("textbox", name="Full Name").fill("Jane Doe")
    dialog.get_by_role("button", name="Save").click()
```

---

## 3. Element Lists & Iteration

```python
from playwright.sync_api import Locator, Page, expect


def handle_element_lists(page: Page) -> None:
    items: Locator = page.get_by_role("listitem")

    expect(items).to_have_count(5)

    first_item: Locator = items.first
    last_item: Locator = items.last
    third_item: Locator = items.nth(2)

    item_texts: list[str] = [
        text for item in items.all() if (text := item.text_content()) is not None
    ]
    print(f"Discovered items: {item_texts}")
```

---

## 4. Asynchronous Idioms (`async_api`)

```python
import pytest
from playwright.async_api import Locator, Page, expect


@pytest.mark.asyncio
async def test_async_locators(page: Page) -> None:
    await page.goto("https://example.com")
    submit_button: Locator = page.get_by_role("button", name="Submit")
    await expect(submit_button).to_be_visible()
    await submit_button.click()
```
