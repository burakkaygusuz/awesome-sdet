# Playwright Network Mocking & API Testing — Python Reference

> Official Playwright 1.62+ Python request interception (page.route), HAR mocking, and APIRequestContext.

---

## 1. Network Interception & Mocking (`page.route`)

```python
import json
from typing import Any
from playwright.sync_api import Page, Route


def demonstrate_network_mocking(page: Page) -> None:
    def handle_profile_route(route: Route) -> None:
        mock_profile: dict[str, Any] = {
            "id": "usr_42",
            "name": "Jane Doe",
            "role": "ADMIN",
            "permissions": ["READ", "WRITE", "DELETE"],
        }
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps(mock_profile),
        )

    page.route("**/api/v1/user/profile", handle_profile_route)

    page.route("**/*analytics*/**", lambda route: route.abort("blockedbyclient"))
    page.route("**/*.{png,jpg,jpeg,svg}", lambda route: route.abort())

    def handle_secure_route(route: Route) -> None:
        headers = route.request.headers | {"X-Mock-Authorization": "Bearer test-token-123"}
        route.continue_(headers=headers)

    page.route("**/api/v1/secure/**", handle_secure_route)
    page.unroute("**/api/v1/user/profile")
```

---

## 2. HAR Replay with `pathlib`

```python
from pathlib import Path
from playwright.sync_api import Page


def replay_har(page: Page) -> None:
    har_path = Path(__file__).parent / "fixtures" / "har" / "checkout.har"
    page.route_from_har(
        har_path,
        url="**/api/checkout/**",
        update=False,
    )
    page.goto("/checkout")
```

---

## 3. Pure API Testing with `APIRequestContext`

```python
from typing import Any
from playwright.sync_api import APIRequestContext, APIResponse, Playwright


def test_api_workflow(playwright: Playwright) -> None:
    api_request_context: APIRequestContext = playwright.request.new_context(
        base_url="https://api.example.com",
        extra_http_headers={"Authorization": "Bearer token-123"},
    )

    create_res: APIResponse = api_request_context.post(
        "/api/v1/users",
        data={"username": "sdet_engineer", "email": "sdet@example.com"},
    )
    assert create_res.ok
    assert create_res.status == 201
    user_data: dict[str, Any] = create_res.json()

    get_res: APIResponse = api_request_context.get(
        f"/api/v1/users/{user_data['id']}"
    )
    assert get_res.status == 200

    api_request_context.dispose()
```

---

## 4. Synchronizing Actions with Network Responses

```python
from typing import Any
from playwright.sync_api import Page, Response


def test_wait_for_response(page: Page) -> None:
    page.goto("/cart")

    def is_checkout_response(response: Response) -> bool:
        return "/api/checkout" in response.url and response.status == 200

    with page.expect_response(is_checkout_response) as response_info:
        page.get_by_role("button", name="Place Order").click()

    response = response_info.value
    data: dict[str, Any] = response.json()
    assert "orderId" in data
```
