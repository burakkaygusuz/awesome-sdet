---
name: playwright-actions-auto-waiting
description: 'Perform deterministic user interactions and leverage the 6-point auto-waiting verification pipeline in Playwright without hardcoded sleeps.'
user-invocable: true
license: MIT
compatibility: Playwright 1.x+
metadata:
  framework: playwright
  keywords:
    - playwright
    - auto-waiting
    - actionability
    - click
    - fill
    - press
    - check
    - uncheck
    - select-option
    - hover
    - drag-to
    - set-input-files
    - synchronization
---

# Auto-Waiting & Actionability Engine

## 1. What Is It?

Playwright performs a comprehensive suite of **actionability checks** on target elements before performing any user interaction. It automatically waits for elements to satisfy all actionability conditions before dispatching synthetic or native events.

Interactions in Playwright include:

- `locator.click()`, `locator.dblclick()`: Clicks or double-clicks the element.
- `locator.fill(value)`: Clears existing input and enters text atomically.
- `locator.press(key)`: Dispatches single keyboard events (e.g. `Enter`, `Tab`, `ArrowDown`).
- `locator.pressSequentially(text)`: Types characters sequentially to trigger dynamic autocomplete or keystroke listeners.
- `locator.check()`, `locator.uncheck()`: Toggles checkbox or radio button inputs with state verification.
- `locator.selectOption(values)`: Selects options in `<select>` elements by value, label, or index.
- `locator.hover()`: Moves the mouse cursor over the element to trigger hover/flyout menus.
- `locator.dragTo(target)`: Drags the source element and drops it onto the target locator.
- `locator.setInputFiles(files)`: Uploads single or multiple files directly without OS dialog interaction.

## 2. Core Capabilities & Responsibilities

- **6-Point Actionability Pipeline**: Every action runs a deterministic pipeline that validates relevant checks before firing events:
  1. **Attached**: Element is connected to the DOM document or Shadow DOM tree.
  2. **Visible**: Element has a non-empty bounding box and is not styled with `display: none` or `visibility: hidden`.
  3. **Stable**: Element is not animating; its bounding box remains identical over consecutive animation frames.
  4. **Receives Events**: The target point is hit-testable and not covered or occluded by overlays, modals, or loading spinners.
  5. **Enabled**: Element does not have the `disabled` attribute or `aria-disabled="true"`.
  6. **Editable**: Element is targetable for text input and is not marked `readonly`.
- **Automatic Timeout & Retry Loop**: If any actionability check fails, Playwright keeps retrying until all checks pass or the configured action timeout (default: 30,000ms) expires with an informative diagnostic error.
- **Controlled Force Bypass**: Supports `{ force: true }` parameter to bypass actionability checks only for intentional edge-case testing.

## 3. Why Use It?

Asynchronous DOM rendering, CSS transitions, and frontend network state updates create timing race conditions in traditional automation frameworks. Playwright's native 6-point auto-waiting pipeline completely eliminates intermittent timing failures without requiring manual waits or arbitrary sleeps.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                        | Anti-Pattern                                                                                      |
| :--------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **Rely on Auto-Waiting**: Allow Playwright's actionability checks to wait automatically.             | **Arbitrary Sleep Delays**: `page.waitForTimeout(3000)` or `time.sleep(3)` polluting test specs.  |
| **Atomic Form Inputs**: `locator.fill('text')` to clear and set values instantaneously.              | **Fragile Clear-and-Type Loops**: Manually sending backspaces or multiple clicks to clear fields. |
| **Semantic Toggle Actions**: Use `locator.check()` and `locator.uncheck()` for checkboxes.           | **Blind Clicks**: Using `locator.click()` on checkboxes without verifying final checked state.    |
| **Direct File Uploads**: Use `locator.setInputFiles('path/to/file.pdf')`.                            | **OS File Choosers**: Attempting to automate OS-level native file picker dialogues.               |
| **Trust Hit-Target Verification**: Let actionability fail if a loading backdrop occludes the button. | **Careless `{ force: true }`**: Bypassing event hit-testing, leading to false positives.          |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_pw_actions_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java` | `csharp`)
- **Resource URI**: `playwright://actions/{language}`
