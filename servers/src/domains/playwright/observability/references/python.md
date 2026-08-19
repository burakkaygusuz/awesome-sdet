# Playwright Observability, Tracing & Visual Testing — Python Reference

> Official Playwright 1.62+ Python execution tracing, visual regression diffing, and error event monitoring.

---

## 1. Trace Recording

```python
from pathlib import Path
from playwright.sync_api import Browser, BrowserContext, Page


def test_trace_recording(browser: Browser) -> None:
    context: BrowserContext = browser.new_context()
    context.tracing.start(screenshots=True, snapshots=True, sources=True)

    page: Page = context.new_page()
    page.goto("https://example.com/dashboard")
    page.get_by_role("button", name="Refresh").click()

    trace_dir = Path("test-results/traces")
    trace_dir.mkdir(parents=True, exist_ok=True)
    context.tracing.stop(path=trace_dir / "dashboard.zip")
    context.close()
```

---

## 2. Visual Regression Testing (`to_have_screenshot`)

```python
from playwright.sync_api import Page, expect


def test_visual_comparison(page: Page) -> None:
    page.goto("https://example.com/dashboard")

    expect(page).to_have_screenshot(
        "dashboard.png",
        max_diff_pixel_ratio=0.02,
        animations="disabled",
    )

    clock = page.get_by_test_id("live-clock")
    expect(page).to_have_screenshot("dashboard-masked.png", mask=[clock])
```

---

## 3. Console & Uncaught Error Monitoring

```python
from playwright.sync_api import Error, Page


def test_console_monitoring(page: Page) -> None:
    uncaught_errors: list[Error] = []
    page.on("pageerror", uncaught_errors.append)

    page.goto("https://example.com/dashboard")
    assert len(uncaught_errors) == 0, f"Uncaught page errors: {uncaught_errors}"
```
