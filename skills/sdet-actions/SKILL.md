---
name: sdet-actions
description: 'Use this skill when simulating user interactions such as clicks, text input, dropdown selection, file uploads, drag-and-drop, and pointer gestures. Trigger when handling interaction timing, auto-waiting pipelines, or complex touch gestures.'
user-invocable: true
license: MIT
metadata:
  capability: 'actions'
  frameworks: 'cypress,selenium,vibium,appium,playwright'
---

# Deterministic User Interactions & Actionability Pipeline

## 1. Overview

Executing actions in test automation involves simulating genuine user interactions (clicks, keyboard input, drag-and-drop, touch gestures, file uploads) in a predictable and deterministic manner. Modern SDET architecture relies on strict **Actionability Pipelines** that verify elements are ready to receive input before any physical or synthetic event is dispatched.

By auto-waiting on actionability conditions, modern test frameworks eliminate flakiness caused by element animations, layout shifts, loading overlays, or disabled form states.

## 2. Core Invariants & Universal Rules

1. **The 6-Point Actionability Pipeline**: Before an action is performed on an element, the runner must verify all relevant conditions:
   - **Attached**: Element is connected to the live DOM tree.
   - **Visible**: Element has non-empty bounding box and is not styled with `display: none` or `visibility: hidden`.
   - **Stable**: Element has completed CSS animations or transitions and is not moving.
   - **Receives Events (Hit-Target Non-Obscured)**: Element is at top-of-stack in its coordinate space and not covered by spinners, backdrops, or sticky headers.
   - **Enabled**: Element does not have the `disabled` attribute or `aria-disabled="true"`.
   - **Editable**: Element is not `readonly` (for text inputs and content-editable nodes).
2. **Zero-Tolerance for Force Overrides**: Avoid bypassing the actionability pipeline via `{ force: true }` or JavaScript synthetic clicks (`element.click()`). Forcing interactions masks critical real-world bugs (e.g. elements hidden behind sticky modals).
3. **Atomic Input Sequences**: Actions combining focus, clear, and entry (such as filling an input) must be executed atomically to trigger expected input and change events without race conditions.
4. **W3C Standardized Gestures**: Virtual mouse, keyboard, and touch interactions must adhere to W3C Actions / Pointer specifications.

### Best Practices vs. Anti-Patterns

| Category             | Best Practice                                                                | Anti-Pattern                                                                  |
| :------------------- | :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Action Readiness** | Rely on framework-native actionability auto-waiting.                         | Inserting arbitrary `sleep(2000)` or `cy.wait(1000)` before clicking.         |
| **Hit Testing**      | Ensure overlays and spinners disappear before triggering clicks.             | Forcing clicks with `{ force: true }` when elements are covered by spinners.  |
| **Input Entry**      | Use atomic fill methods (`locator.fill('text')`) that clear and type safely. | Sending sequential raw keystrokes without clearing previous state.            |
| **Drag and Drop**    | Use high-level drag-and-drop APIs with coordinate stability verification.    | Simulating manual mouse events using raw DOM JavaScript dispatch.             |
| **File Uploads**     | Use dedicated file payload attachment APIs (`setInputFiles`, `selectFile`).  | Interacting with hidden `<input type="file">` by removing CSS `display:none`. |

## 3. When to Use

- **When to Use**:
  - Automating user interactions: clicks, double-clicks, right-clicks, and hover states.
  - Filling forms, clearing inputs, selecting dropdown items, toggling checkboxes, and radio buttons.
  - Executing complex gestures: drag-and-drop, multi-touch gestures, swipes, and mouse wheel scrolling.
  - Uploading or downloading files through standard browser dialogues.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Locating elements and writing selectors -> Use [sdet-locators](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-locators/SKILL.md).
  - Verifying state, text, or DOM conditions after interactions -> Use [sdet-assertions](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-assertions/SKILL.md).
  - Managing mobile device app lifecycle or permissions -> Use [sdet-mobile](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-mobile/SKILL.md).

## 4. Universal Framework Paradigm Mapping

| Automation Framework | Action Pipeline & Synchronization                             | Text Input Strategy                                  | Gestures & Pointer Chains                                           |
| :------------------- | :------------------------------------------------------------ | :--------------------------------------------------- | :------------------------------------------------------------------ |
| **Playwright**       | Native 6-point auto-waiting pipeline                          | `locator.fill()` (atomic clearing + fast text input) | `locator.dragTo()`, `page.mouse`                                    |
| **Cypress**          | Built-in actionability checks                                 | `cy.type()` (keystroke-level typing)                 | `cypress-real-events` (`cy.realClick()`)                            |
| **Selenium 4**       | `WebDriverWait` + `ExpectedConditions.elementToBeClickable()` | `element.clear()` followed by `element.sendKeys()`   | W3C `Actions` API (`new Actions(driver).moveToElement().perform()`) |
| **Vibium**           | Built-in auto-waiting action pipeline                         | `element.type()`, `element.fill()`                   | Pointer gestures and drag operations                                |
| **Appium**           | Explicit mobile waiters before gesture execution              | `element.sendKeys()`                                 | W3C `ActionChains` (`PointerInput` swipe, scroll, tap)              |

## 5. Dynamic MCP Tool & Resource Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `sdet-mcp` tools or read dynamic resources:

- **Playwright**: `read_pw_actions_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URI: `playwright://actions/{language}`
- **Cypress**: `read_cy_commands_docs` (Parameters: `language: "typescript" | "javascript"`) -> URI: `cypress://commands/{language}`
- **Selenium**: `read_se_actions_docs` (Parameters: `language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby"`) -> URI: `selenium://actions/{language}`
- **Vibium**: `read_vibium_interactions_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java"`) -> URI: `vibium://interactions/{language}`
- **Appium**: `read_appium_gestures_docs` (Parameters: `gesture: "tap" | "double_tap" | "long_press" | "swipe" | "scroll" | "drag_and_drop" | "pinch_zoom"`, `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URI: `appium://gestures/{language}`
