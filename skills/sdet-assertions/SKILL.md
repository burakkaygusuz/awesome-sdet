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

## 3. When to Use

- **When to Use**:
  - Verifying UI element visibility, text content, attributes, counts, and form states.
  - Synchronizing on asynchronous state transitions, modal appearances, and toasts.
  - Validating multiple independent table cells or form inputs using soft assertions.
  - Polling non-DOM asynchronous backend jobs, responses, or storage mutations.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Defining element selectors and locators -> Use [sdet-locators](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-locators/SKILL.md).
  - Executing user clicks, keyboard typing, or drag-and-drop -> Use [sdet-actions](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-actions/SKILL.md).
  - Awaiting network responses and status codes -> Use [sdet-network](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-network/SKILL.md).

## 4. Universal Framework Paradigm Mapping

| Automation Framework | Assertion Engine & Auto-Retry                                    | Soft Assertions Support                        | Custom Condition Polling                              |
| :------------------- | :--------------------------------------------------------------- | :--------------------------------------------- | :---------------------------------------------------- |
| **Playwright**       | Web-First `expect(locator).toBeVisible()`                        | `expect.soft(locator).toHaveText()`            | `expect.poll(() => ...).toBe()` / `expect().toPass()` |
| **Cypress**          | Implicit retry assertions (`.should('be.visible')`)              | `cypress-soft-assertions` plugin               | Custom recursive `.should(($el) => ...)`              |
| **Selenium 4**       | `WebDriverWait` + `ExpectedConditions` + AssertJ/JUnit/pytest    | Test runner soft assertions (`SoftAssertions`) | `FluentWait.pollingEvery().ignoring()`                |
| **Vibium**           | Web-First condition assertions (`assert visible`, `assert text`) | Native soft condition checks                   | Condition polling streams                             |

## 5. Dynamic MCP Tool & Resource Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `sdet-mcp` tools when implementing assertions:

- **Playwright Assertions**: When implementing Playwright web-first expectations or polling, invoke `read_pw_assertions_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URI: `playwright://assertions/{language}`
- **Cypress Assertions**: When implementing Cypress assertions or retry blocks, invoke `read_cy_commands_docs` (Parameters: `language: "typescript" | "javascript"`) -> URI: `cypress://commands/{language}`
- **Selenium Waits**: When implementing Selenium 4 explicit waits and condition polling, invoke `execute_se_explicit_wait`
- **Vibium Core Assertions**: When implementing Vibium web-first assertions or polling streams, invoke `read_vibium_core_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java"`) -> URI: `vibium://core/{language}`
