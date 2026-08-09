# Vibium State & Recording Management — Python API Reference

> Vibium (v26.5.31) provides authentication state snapshots (`storage_state`), session tracing, recording chunking/grouping, and multi-tab context isolation.

---

## 1. Storage State Snapshots

```python
from vibium import browser

def test_auth_storage_state():
    # Capture authenticated state snapshot
    bro = browser.start(headless=True)
    try:
        page = bro.page()
        page.go("https://app.example.com/login")

        username = page.find("label=Username")
        username.fill("python_tester")

        login_btn = page.find({"role": "button", "text": "Log in"})
        login_btn.click()

        bro.storage_state(path="auth_state.json")
    finally:
        bro.stop()

    # Reuse storageState to bypass repeated UI logins
    auth_bro = browser.start(headless=True, storage_state="auth_state.json")
    try:
        auth_page = auth_bro.page()
        auth_page.go("https://app.example.com/dashboard")
    finally:
        auth_bro.stop()
```

---

## 2. Multi-Tab Handling

```python
def test_tabs(bro):
    main_page = bro.page()
    new_page = bro.new_page()
    new_page.go("https://app.example.com/docs")

    print("Open tab count:", len(bro.pages()))

    main_page.bring_to_front()
    new_page.close()
```
