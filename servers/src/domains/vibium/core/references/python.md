# Vibium Core & CLI Architecture — Python API Reference (Vibium 26.x+)

> Official Vibium 26.5+ Python browser lifecycle, launch options, and Sense-Think-Act CLI architecture.

---

## 1. Synchronous Browser Lifecycle & Setup

```python
from vibium import Element, Vibe, browserSync


def run_vibium_sync() -> None:
    vibe: Vibe = browserSync.launch(headless=True)
    try:
        vibe.go("https://app.example.com")
        vibe.evaluate("() => document.title")

        submit_btn: Element = vibe.find(role="button", text="Get Started")
        submit_btn.click()
    finally:
        vibe.quit()


if __name__ == "__main__":
    run_vibium_sync()
```

---

## 2. Asynchronous Browser Lifecycle & Setup

```python
import asyncio
from vibium import Element, Vibe, browser


async def run_vibium_async() -> None:
    vibe: Vibe = await browser.launch(headless=True)
    try:
        await vibe.go("https://app.example.com/login")

        email_input: Element = await vibe.find(role="textbox", text="Email")
        await email_input.fill("sdet@example.com")

        submit_btn: Element = await vibe.find(role="button", text="Sign In")
        await submit_btn.click()

        await vibe.find(role="heading", text="Dashboard")
    finally:
        await vibe.quit()


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

## 4. Best Practices

- **Explicit Lifecycle Management**: Always invoke `vibe.quit()` or `await vibe.quit()` inside `try ... finally` blocks.
- **Async vs Sync Alignment**: Select `browserSync.launch()` for synchronous scripts and `await browser.launch()` for asyncio frameworks.
- **Zero Arbitrary Sleeps**: Rely exclusively on Vibium's auto-waiting actionability pipeline.
