# Vibium Core & CLI Architecture — Python API Reference (Vibium 26.x+)

> Vibium (v26.5.31) is an AI-native browser automation framework built on W3C WebDriver BiDi, unifying the Sense-Think-Act agent loop, `@ref` element mapping, and multi-language client libraries.

---

## 1. Synchronous Browser Lifecycle & Setup

```python
from vibium import browser

def run_vibium_sync() -> None:
    bro = browser.start(headless=True)
    try:
        vibe = bro.page()
        vibe.go("https://app.example.com")
        print("Page Title:", vibe.evaluate("() => document.title"))

        submit_btn = vibe.find({"role": "button", "text": "Get Started"})
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
from vibium.async_api import browser

async def run_vibium_async() -> None:
    bro = await browser.start(headless=True)
    try:
        vibe = await bro.page()
        await vibe.go("https://app.example.com/login")

        email_input = await vibe.find({"role": "textbox", "text": "Email"})
        await email_input.fill("sdet@example.com")

        submit_btn = await vibe.find({"role": "button", "text": "Sign In"})
        await submit_btn.click()

        await vibe.check("verify user lands on dashboard")
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
