# Vibium Core & CLI Architecture — Python API Reference (Vibium 26.x+)

> Vibium (v26.5.31) is an AI-native browser automation framework built on W3C WebDriver BiDi, unifying the Sense-Think-Act agent loop, `@ref` element mapping, and multi-language client libraries.

---

## 1. Synchronous Browser Lifecycle & Setup

```python
from vibium import Browser, Element, Page, browser


def run_vibium_sync() -> None:
    bro: Browser = browser.start(headless=True)
    try:
        page: Page = bro.page()
        page.go("https://app.example.com")
        print("Page Title:", page.evaluate("() => document.title"))

        submit_btn: Element = page.find(role="button", text="Get Started")
        submit_btn.click()
    finally:
        bro.stop()


if __name__ == "__main__":
    run_vibium_sync()
```

---

## 2. Asynchronous Browser Lifecycle & Setup

```python
import asyncio
from vibium.async_api import (
    Browser as AsyncBrowser,
    Element as AsyncElement,
    Page as AsyncPage,
    browser as async_browser,
)


async def run_vibium_async() -> None:
    bro: AsyncBrowser = await async_browser.start(headless=True)
    try:
        page: AsyncPage = await bro.page()
        await page.go("https://app.example.com/login")

        email_input: AsyncElement = await page.find(role="textbox", text="Email")
        await email_input.fill("sdet@example.com")

        submit_btn: AsyncElement = await page.find(role="button", text="Sign In")
        await submit_btn.click()

        # find() waits for the element; ElementNotFoundError fails the flow if absent
        await page.find(role="heading", text="Dashboard")
    finally:
        await bro.stop()


if __name__ == "__main__":
    asyncio.run(run_vibium_async())
```

---

## 3. CLI Integration (Vibium 26.5.31)

```bash
# Sense-Think-Act CLI Loop
vibium go https://app.example.com
vibium map

# Act via @refs
vibium fill @e2 "sdet@example.com"
vibium click @e1

# Differential snapshot check
vibium map --diff
```

---

## Best Practices

- **Explicit Lifecycle Management**: Always invoke `bro.stop()` or `await bro.stop()` inside `try ... finally` blocks.
- **Async vs Sync Alignment**: Select `vibium.browser` for synchronous scripts and `vibium.async_api.browser` for asyncio frameworks.
