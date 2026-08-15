# Playwright Storage State & Authentication — Python Reference

> Playwright Python persists session state using `storage_state` and provides Pytest fixtures for multi-role contexts.

---

## 1. Authentication State Persistence

```python
from pathlib import Path
from playwright.sync_api import Browser, BrowserContext, Page


def test_save_auth_state(browser: Browser) -> None:
    context: BrowserContext = browser.new_context()
    page: Page = context.new_page()

    page.goto("https://example.com/login")
    page.get_by_label("Username").fill("standard_user")
    page.get_by_label("Password").fill("secret_pass")
    page.get_by_role("button", name="Sign in").click()

    page.wait_for_url("**/dashboard")

    auth_dir = Path("playwright/.auth")
    auth_dir.mkdir(parents=True, exist_ok=True)
    context.storage_state(path=auth_dir / "user.json")
    context.close()
```

---

## 2. Pytest Multi-Role Fixtures (`conftest.py`)

```python
from collections.abc import Generator
from pathlib import Path
import pytest
from playwright.sync_api import Browser, BrowserContext, Page


@pytest.fixture(scope="session")
def auth_user_state(browser: Browser) -> Path:
    auth_path = Path("playwright/.auth/user.json")
    if auth_path.exists():
        return auth_path

    auth_path.parent.mkdir(parents=True, exist_ok=True)
    context: BrowserContext = browser.new_context()
    page: Page = context.new_page()
    page.goto("https://example.com/login")
    page.get_by_label("Username").fill("user")
    page.get_by_label("Password").fill("pass")
    page.get_by_role("button", name="Sign in").click()
    page.wait_for_url("**/dashboard")

    context.storage_state(path=auth_path)
    context.close()
    return auth_path


@pytest.fixture
def authenticated_page(
    browser: Browser, auth_user_state: Path
) -> Generator[Page, None, None]:
    context: BrowserContext = browser.new_context(storage_state=auth_user_state)
    page: Page = context.new_page()
    yield page
    context.close()
```

---

## 3. Cookie Management

```python
from typing import Any
from playwright.sync_api import BrowserContext


def manage_cookies(context: BrowserContext) -> None:
    context.add_cookies(
        [
            {
                "name": "session_id",
                "value": "token_abc123",
                "domain": ".example.com",
                "path": "/",
                "httpOnly": True,
                "secure": True,
                "sameSite": "Lax",
            }
        ]
    )

    cookies: list[dict[str, Any]] = context.cookies("https://example.com")
    context.clear_cookies()
```
