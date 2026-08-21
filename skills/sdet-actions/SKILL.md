---
name: sdet-actions
description: 'Use this skill when simulating user interactions such as clicking buttons, filling forms, typing text, selecting dropdowns, uploading files, dragging elements, or performing pointer and touch gestures across web and mobile tests, even if the request does not explicitly mention actions.'
user-invocable: true
license: MIT
metadata:
  capability: 'actions'
  frameworks: 'cypress,selenium,vibium,appium,playwright'
---

# Deterministic User Interactions & Actionability Pipeline

## 1. Overview

Simulating genuine user interactions requires strict actionability verification (attached, visible, stable, un-obscured, enabled, editable) before dispatching physical or synthetic events to guarantee deterministic execution.

## 2. Core Invariants & Universal Rules

1. **Verify Actionability Before Dispatch**: Ensure elements are attached, visible, stable, un-obscured, enabled, and editable before dispatching events, because firing events on animating or obstructed elements causes intermittent test flakes.
2. **Avoid Force Bypasses**: Avoid `{ force: true }` or synthetic JavaScript clicks (`element.click()`) because forced events bypass browser hit-testing and mask real user-facing bugs such as sticky headers or modal backdrops.
3. **Atomic Input Over Incremental Keystrokes**: Prefer atomic clear-and-fill methods (`locator.fill()`) over manual backspace typing loops because atomic input guarantees deterministic form state without race conditions.
4. **Standardized W3C Pointer Chains**: Compose multi-step mouse, pen, or touch interactions using native W3C Pointer sequences rather than ad-hoc coordinate dispatches.

### Gotchas & Critical Traps

- **Hidden File Inputs**: Never manipulate DOM CSS (`display: none` removal) to click file inputs; pass payloads directly via framework file attachment APIs (`setInputFiles`, `selectFile`).
- **Framework Synthetic Events**: Modifying input values directly via script evaluation does not trigger React/Vue `onChange` state updates; use native framework fill/type methods.
- **Hover Menus in Headless CI**: Mouse hover states can reset between actions in headless runners if subsequent commands lack pointer coordinate continuity.

## 3. Step-by-Step Workflow

1. **Resolve Target Element**: Query element using semantic accessible locators from [sdet-locators](../sdet-locators/SKILL.md).
2. **Ensure Actionability**: Rely on native framework auto-waiting or explicit condition waiters (`toBeVisible`, `elementToBeClickable`).
3. **Dispatch Interaction**: Execute atomic actions (`fill()`, `click()`, `selectOption()`) without force overrides.
4. **Trigger Verification**: Hand off to [sdet-assertions](../sdet-assertions/SKILL.md) and run `verify_test_artifact`.

## 4. When to Use

- **When to Use**:
  - Automating user interactions: clicks, double-clicks, right-clicks, and hover states.
  - Filling forms, clearing inputs, selecting dropdown items, toggling checkboxes, and radio buttons.
  - Executing complex gestures: drag-and-drop, multi-touch gestures, swipes, and mouse wheel scrolling.
  - Uploading or downloading files through standard browser dialogues.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Locating elements and writing selectors -> Use [sdet-locators](../sdet-locators/SKILL.md).
  - Verifying state, text, or DOM conditions after interactions -> Use [sdet-assertions](../sdet-assertions/SKILL.md).
  - Managing mobile device app lifecycle or permissions -> Use [sdet-mobile](../sdet-mobile/SKILL.md).

## 5. Universal Framework Paradigm Mapping

| Automation Framework | Action Pipeline & Synchronization                             | Text Input Strategy                                  | Gestures & Pointer Chains                                           |
| :------------------- | :------------------------------------------------------------ | :--------------------------------------------------- | :------------------------------------------------------------------ |
| **Playwright**       | Native 6-point auto-waiting pipeline                          | `locator.fill()` (atomic clearing + fast text input) | `locator.dragTo()`, `page.mouse`                                    |
| **Cypress**          | Built-in actionability checks                                 | `cy.type()` (keystroke-level typing)                 | `cypress-real-events` (`cy.realClick()`)                            |
| **Selenium 4**       | `WebDriverWait` + `ExpectedConditions.elementToBeClickable()` | `element.clear()` followed by `element.sendKeys()`   | W3C `Actions` API (`new Actions(driver).moveToElement().perform()`) |
| **Vibium**           | Built-in auto-waiting action pipeline                         | `element.type()`, `element.fill()`                   | Pointer gestures and drag operations                                |
| **Appium**           | `WebDriverWait` + `ExpectedConditions`                        | `element.sendKeys()`                                 | W3C `ActionChains` (`PointerInput` swipe, scroll, tap)              |

## 6. Dynamic MCP Knowledge & Tool Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `read_sdet_docs`:

- **Playwright Actions**: When implementing Playwright clicks, fills, or drag-and-drop, invoke `read_sdet_docs({ framework: "playwright", domain: "actions", language: "typescript" | "javascript" | "python" | "java" | "csharp" })`.
- **Cypress Commands**: When implementing Cypress click, type, or custom commands, invoke `read_sdet_docs({ framework: "cypress", domain: "commands", language: "typescript" | "javascript" })`.
- **Selenium Actions**: When implementing Selenium 4 W3C action chains or keyboard events, invoke `read_sdet_docs({ framework: "selenium", domain: "actions", language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby" })`.
- **Vibium Interactions**: When implementing Vibium clicks, fills, or auto-waiting interactions, invoke `read_sdet_docs({ framework: "vibium", domain: "interactions", language: "typescript" | "javascript" | "python" | "java" })`.
- **Appium Gestures**: When implementing Appium mobile touch gestures, swipes, or scroll chains, invoke `read_sdet_docs({ framework: "appium", domain: "gestures", language: "typescript" | "javascript" | "python" | "java" | "csharp" })`.

Universal quality invariants and execution rules are accessible via `sdet://guidelines` and `sdet://invariants`.

## 7. Verification Checklist

- [ ] Zero arbitrary time delays (`waitForTimeout`, `sleep`) used.
- [ ] No `{ force: true }` or synthetic JS `element.click()` bypasses.
- [ ] Atomic `fill()` chosen over character-by-character loops.
- [ ] Validated via `verify_test_artifact({ code, framework, language })` with 100/100 score.
