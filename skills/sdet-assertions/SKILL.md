---
name: sdet-assertions
description: 'Use this skill when verifying test outcomes, asserting UI states, or synchronizing asynchronous events. Trigger when writing auto-retrying expectations, polling custom conditions, checking soft assertions, or eliminating flaky arbitrary sleeps across test suites, even without explicit mention of assertions.'
user-invocable: true
license: MIT
metadata:
  capability: 'assertions'
  frameworks: 'cypress,selenium,vibium,playwright'
---

# Web-First Auto-Retrying Assertions & Deterministic Synchronization

## 1. Overview

Web-first auto-retrying assertions poll the DOM continuously until expectations pass or timeouts expire, eliminating race conditions caused by asynchronous rendering, animation delays, or hydration lag.

## 2. Core Invariants & Universal Rules

1. **Eliminate Arbitrary Sleeps**: Avoid hardcoded delays (`sleep(3000)`, `cy.wait(5000)`) because fixed timers waste execution time when tests are fast and still fail when environments slow down; synchronize strictly on condition waiters and event streams.
2. **Web-First Auto-Retrying Assertions**: Assert directly on element locators (`expect(locator).toBeVisible()`) rather than fetching static text variables, because static variables snapshot a single instant and miss asynchronous DOM mutations.
3. **Soft Assertions for Form & Matrix Validations**: Use soft assertions (`expect.soft()`) when verifying independent fields on a single page, because failing on the first field prevents uncovering all validation errors in one run.
4. **Deterministic Custom Polling**: Await background jobs or database mutations using bounded polling blocks (`expect.poll()`, `expect().toPass()`, `FluentWait`) with explicit timeouts and intervals to prevent infinite hangs.
5. **Keep Assertions in Test Specs**: Place assertions exclusively in test spec files and orchestration flows rather than inside Page Object helper methods, because embedding assertions in page objects destroys their reusability across negative test scenarios.

### Gotchas & Critical Traps

- **Negated Assertion Timeouts**: Negated assertions (`expect(locator).not.toBeVisible()`) wait for the full timeout if the element remains visible; configure targeted short timeouts when asserting rapid element removal.
- **Detached vs Hidden Verification**: Elements styled with `opacity: 0` or obscured by overlays remain connected in the DOM; asserting `.not.toBeAttached()` will fail where `.not.toBeVisible()` succeeds.
- **Cypress `.then()` Retry Break**: Chaining `.should()` after `.then()` blocks breaks Cypress's automatic retry-and-re-query loop for dynamic elements.

## 3. Step-by-Step Workflow

1. **Identify Target Verification Criteria**: Determine whether the check is element visibility, text match, state change, or asynchronous polling.
2. **Apply Web-First Auto-Retrying Assertion**: Write locator-based assertions (e.g. `expect(locator).toBeVisible()`) rather than fetching static text variables.
3. **Handle Matrix Validations**: Group independent form or grid checks under `expect.soft()` to report all validation failures in a single run.
4. **Enforce Deterministic Isolation**: Keep assertions in test specs (never inside Page Objects) and verify with `verify_test_artifact`.

## 4. When to Use

- **When to Use**:
  - Verifying UI element visibility, text content, attributes, counts, and form states.
  - Synchronizing on asynchronous state transitions, modal appearances, and toasts.
  - Validating multiple independent table cells or form inputs using soft assertions.
  - Polling non-DOM asynchronous backend jobs, responses, or storage mutations.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Defining element selectors and locators -> Use [sdet-locators](../sdet-locators/SKILL.md).
  - Executing user clicks, keyboard typing, or drag-and-drop -> Use [sdet-actions](../sdet-actions/SKILL.md).
  - Awaiting network responses and status codes -> Use [sdet-network](../sdet-network/SKILL.md).

## 5. Universal Framework Paradigm Mapping

| Automation Framework | Assertion Engine & Auto-Retry                                    | Soft Assertions Support                        | Custom Condition Polling                              |
| :------------------- | :--------------------------------------------------------------- | :--------------------------------------------- | :---------------------------------------------------- |
| **Playwright**       | Web-First `expect(locator).toBeVisible()`                        | `expect.soft(locator).toHaveText()`            | `expect.poll(() => ...).toBe()` / `expect().toPass()` |
| **Cypress**          | Implicit retry assertions (`.should('be.visible')`)              | `cypress-soft-assertions` plugin               | Custom recursive `.should(($el) => ...)`              |
| **Selenium 4**       | `WebDriverWait` + `ExpectedConditions` + AssertJ/JUnit/pytest    | Test runner soft assertions (`SoftAssertions`) | `FluentWait.pollingEvery().ignoring()`                |
| **Vibium**           | Web-First condition assertions (`assert visible`, `assert text`) | Native soft condition checks                   | Condition polling streams                             |

## 6. Dynamic MCP Knowledge & Tool Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `read_sdet_docs`:

- **Playwright Assertions**: When implementing Playwright web-first expectations or polling, invoke `read_sdet_docs({ framework: "playwright", domain: "assertions", language: "typescript" | "javascript" | "python" | "java" | "csharp" })`.
- **Cypress Assertions**: When implementing Cypress assertions or retry blocks, invoke `read_sdet_docs({ framework: "cypress", domain: "commands", language: "typescript" | "javascript" })`.
- **Selenium Waits**: When implementing Selenium 4 explicit waits and condition polling, invoke `read_sdet_docs({ framework: "selenium", domain: "actions" | "locators", language: "typescript" | "javascript" | "python" | "java" | "csharp" | "ruby" })`.
- **Vibium Core Assertions**: When implementing Vibium web-first assertions or polling streams, invoke `read_sdet_docs({ framework: "vibium", domain: "core", language: "typescript" | "javascript" | "python" | "java" })`.

Universal quality invariants and execution rules are accessible via `sdet://guidelines` and `sdet://invariants`.

## 7. Verification Checklist

- [ ] Zero arbitrary time delays (`waitForTimeout`, `sleep`) used.
- [ ] Explicit assertions present in the test spec body.
- [ ] No assertions placed inside Page Object methods.
- [ ] Validated via `verify_test_artifact({ code, framework, language })` with 100/100 score.
