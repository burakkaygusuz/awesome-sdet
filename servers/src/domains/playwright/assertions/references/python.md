# Playwright Web-First Assertions — Python Reference

> Official Playwright 1.62+ Python auto-retrying web-first assertions, attribute matching, and dynamic polling.

---

## 1. Locator State Assertions

```python
from playwright.sync_api import Locator, Page, expect


def demonstrate_assertions(page: Page) -> None:
    submit_btn: Locator = page.get_by_role("button", name="Submit")
    terms_checkbox: Locator = page.get_by_role("checkbox", name="Terms")
    search_input: Locator = page.get_by_placeholder("Search")
    alert_banner: Locator = page.get_by_role("alert")

    expect(submit_btn).to_be_visible()
    expect(alert_banner).to_be_hidden()
    expect(alert_banner).to_be_attached()

    expect(submit_btn).to_be_enabled()
    expect(submit_btn).not_to_be_disabled()
    expect(search_input).to_be_editable()
    expect(search_input).to_be_focused()

    expect(terms_checkbox).to_be_checked()
    expect(search_input).to_be_empty()
```

---

## 2. Content, Attribute & Page Assertions

```python
import re
from playwright.sync_api import Locator, Page, expect


def demonstrate_content_assertions(page: Page) -> None:
    header: Locator = page.get_by_role("heading", level=1)
    items: Locator = page.get_by_role("listitem")
    user_card: Locator = page.get_by_test_id("user-profile")
    email_input: Locator = page.get_by_label("User Email")

    expect(header).to_have_text("Welcome to Dashboard")
    expect(header).to_have_text(re.compile(r"welcome to", re.IGNORECASE))
    expect(header).to_contain_text("Dashboard")

    expect(user_card).to_have_attribute("data-status", "active")
    expect(user_card).to_have_class(re.compile(r"card-highlighted"))
    expect(user_card).to_have_id("user-42")

    expect(email_input).to_have_value("admin@example.com")
    expect(items).to_have_count(5)

    expect(page).to_have_url("https://example.com/dashboard")
    expect(page).to_have_title("Enterprise SDET Dashboard")
```

---

## 3. Dynamic Polling with `expect.poll`

```python
import requests
from playwright.sync_api import expect


def demonstrate_polling() -> None:
    def get_job_status() -> str:
        response = requests.get(
            "https://api.example.com/jobs/123/status", timeout=5
        )
        data: dict[str, str] = response.json()
        return data.get("status", "PENDING")

    expect.poll(
        get_job_status, timeout=15_000, intervals=[1_000, 2_000]
    ).to_equal("COMPLETED")
```
