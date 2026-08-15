---
name: playwright-assertions
description: 'Author resilient, web-first auto-retrying assertions, compound block retries, and dynamic condition polling in Playwright.'
user-invocable: true
license: MIT
compatibility: Playwright 1.x+
metadata:
  framework: playwright
  keywords:
    - playwright
    - assertions
    - web-first-assertions
    - expect
    - to-be-visible
    - to-have-text
    - to-have-value
    - to-have-count
    - to-have-url
    - to-pass
    - poll
---

# Web-First Auto-Retrying Assertions

## 1. What Is It?

Playwright provides **Web-First Assertions** through the `expect(locator)` API. Unlike traditional synchronous assertions (which immediately evaluate a snapshot of element state and fail on transient conditions), web-first assertions automatically wait and retry until the expected condition is met or the assertion timeout (default: 5,000ms) is reached.

Core assertions include:

- `await expect(locator).toBeVisible()`: Asserts element is attached and visible.
- `await expect(locator).toBeHidden()`: Asserts element is absent from DOM or invisible.
- `await expect(locator).toBeEnabled()`, `toBeDisabled()`: Verifies interactive state.
- `await expect(locator).toBeChecked()`: Asserts checkbox or radio button is checked.
- `await expect(locator).toHaveText(textOrRegex)`: Matches full inner text.
- `await expect(locator).toContainText(textOrRegex)`: Verifies substring presence.
- `await expect(locator).toHaveValue(valueOrRegex)`: Asserts form input value.
- `await expect(locator).toHaveAttribute(name, value)`: Verifies DOM attributes.
- `await expect(locator).toHaveCount(count)`: Asserts exact match count for multi-element locators.
- `await expect(page).toHaveURL(urlOrRegex)`: Asserts page navigation and route.
- `await expect(page).toHaveTitle(titleOrRegex)`: Asserts document title.

## 2. Core Capabilities & Responsibilities

- **Auto-Retrying Polling Engine**: Continuously polls the element state at 100ms intervals, ensuring assertions pass as soon as asynchronous network responses or animation transitions render the target UI state.
- **Custom Asynchronous Polling (`expect.poll()`)**: Converts arbitrary async getter functions or API queries into auto-retrying assertions: `await expect.poll(async () => await fetchStatus()).toBe('READY')`.
- **Compound Block Retries (`expect().toPass()`)**: Retries an entire block of multi-step actions and assertions until all statements pass without throwing: `await expect(async () => { await page.reload(); await expect(locator).toBeVisible(); }).toPass()`.
- **Soft Assertions (`expect.soft()`)**: Marks test as failed upon assertion mismatch without halting subsequent test execution steps, aggregating all failures at the end of the test.
- **Visual & ARIA Snapshots**: Verifies visual fidelity with `expect(page).toHaveScreenshot()` and accessible structure with `expect(locator).toMatchAriaSnapshot()`.

## 3. Why Use It?

Modern web applications are inherently asynchronous. Synchronous assertions (like `assert locator.innerText == 'text'`) cause severe flakiness because they execute before UI state transitions complete. Web-first assertions eliminate timing race conditions deterministically.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                      | Anti-Pattern                                                                                          |
| :------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Use Web-First `expect(locator)`**: `await expect(locator).toBeVisible()`.                        | **Synchronous Assertions**: `expect(await locator.isVisible()).toBe(true)` which does not auto-retry. |
| **Compound Retries with `.toPass()`**: Wrap retryable multi-step workflows in `expect().toPass()`. | **Manual Sleep Loops**: `while (!ready) { sleep(1000); }` creating unmaintainable code.               |
| **Asynchronous Polling with `expect.poll()`**: Poll backend state or dynamic getters cleanly.      | **Arbitrary Network Waits**: Waiting fixed milliseconds for backend processing to complete.           |
| **Assert URL via `expect(page).toHaveURL()`**: Automatically waits for redirects to finish.        | **Direct String Equality on `page.url()`**: Asserting `page.url() === expected` immediately.          |
| **Soft Assertions for Form Audits**: Use `expect.soft()` to validate all validation messages.      | **Early Test Abort**: Failing on the first minor label typo and skipping subsequent field checks.     |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_pw_assertions_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java` | `csharp`)
- **Resource URI**: `playwright://assertions/{language}`
