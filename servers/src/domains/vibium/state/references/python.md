# Vibium State & Recording Management — Python API Reference (Vibium 26.x+)

> Official Vibium 26.5+ Python authentication state snapshots (`storage_state`), session cookies, local storage serialization, session tracing, and multi-tab context isolation.

---

## 1. Storage State & Auth Snapshots

```python
from pathlib import Path
from vibium import Element, Vibe, browserSync


def test_auth_storage_state() -> None:
    auth_path = Path(".auth/admin_state.json")
    auth_path.parent.mkdir(parents=True, exist_ok=True)

    vibe: Vibe = browserSync.launch(headless=True)
    try:
        vibe.go("https://app.example.com/login")

        username: Element = vibe.find(label="Username")
        username.fill("python_tester")

        password: Element = vibe.find(label="Password")
        password.fill("SecureP@ss123")

        login_btn: Element = vibe.find(role="button", text="Sign In")
        login_btn.click()

        vibe.storage_state(path=str(auth_path))
    finally:
        vibe.quit()

    auth_vibe: Vibe = browserSync.launch(
        headless=True, storage_state=str(auth_path)
    )
    try:
        auth_vibe.go("https://app.example.com/dashboard")
    finally:
        auth_vibe.quit()
```

---

## 2. Multi-Tab & Page Management

```python
from vibium import Vibe, browserSync


def test_tabs() -> None:
    vibe: Vibe = browserSync.launch()
    try:
        new_vibe: Vibe = vibe.new_page()
        new_vibe.go("https://app.example.com/docs")

        vibe.bring_to_front()
        new_vibe.close()
    finally:
        vibe.quit()
```

---

## 3. Session Cookies & Local Storage Serialization

```python
from vibium import Vibe, browserSync


def test_cookies_and_storage() -> None:
    vibe: Vibe = browserSync.launch()
    try:
        vibe.set_cookies(
            [
                {
                    "name": "session_token",
                    "value": "py_jwt_token_xyz",
                    "domain": ".example.com",
                    "path": "/",
                    "httpOnly": True,
                    "secure": True,
                }
            ]
        )

        cookies = vibe.cookies("https://app.example.com")

        vibe.evaluate(
            "() => localStorage.setItem('user_prefs', JSON.stringify({ theme: 'dark' }))"
        )

        vibe.clear_cookies()
    finally:
        vibe.quit()
```

---

## 4. Session Tracing & Recording (CLI v26.5.31)

```bash
# Start full video and BiDi event recording
vibium record start --video --output ./reports/session.zip

# Grouping subcommands (v26.5.31)
vibium record start-group --name "login-flow"
vibium go https://app.example.com/login
vibium record stop-group

# Chunking subcommands (v26.5.31)
vibium record start-chunk --name "checkout-step-1"
vibium click @e5
vibium record stop-chunk

# Finalize recording
vibium record stop
```

---

## 5. Best Practices

- **Never share storage state across concurrent workers**: Give each parallel worker thread its own isolated storage state file.
- **Use chunked recordings for long journeys**: Leverage `start-chunk` and `stop-chunk` to split large test runs into distinct debuggable archives.
- **Always close browser on teardown**: Auto-flush recordings and finalize storage snapshots inside `try ... finally` blocks.
