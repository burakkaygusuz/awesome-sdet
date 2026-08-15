---
name: sdet-assertions
description: 'Use this skill when asserting expected test outcomes, verifying UI states, or synchronizing asynchronous events. Trigger when writing auto-retrying web-first expectations, polling custom conditions, or eliminating flaky arbitrary sleeps.'
user-invocable: true
license: MIT
metadata:
  capability: 'assertions'
  frameworks: 'cypress,selenium,vibium,playwright'
---

# Web-First Auto-Retrying Assertions & Deterministic Synchronization

## 1. Overview

In modern web applications, the DOM is asynchronous, dynamic, and reactive. UI elements render, hydrate, mutate, and animate over time. Traditional static assertions (e.g. `assert(element.getText() == "Saved")`) take instantaneous snapshots that fail immediately if asynchronous rendering or network requests are in-flight.

**Web-First Auto-Retrying Assertions** poll the DOM continuously until the expected condition is satisfied or a specified timeout expires. Combined with condition-based synchronization, this architecture guarantees zero flakiness without resorting to hardcoded time delays.

## 2. Core Invariants & Universal Rules

1. **Zero-Tolerance for Arbitrary Sleeps**: Never use hardcoded time delays (`sleep()`, `cy.wait(3000)`, `Thread.sleep(5000)`). All synchronization must bind to framework-native condition waiters, auto-retrying assertions, or network/event streams.
2. **Web-First Auto-Retrying Assertions**: Assertions on DOM elements must retry automatically across the configured assertion timeout (e.g. `expect(locator).toBeVisible()`, `cy.should('be.visible')`, `wait.until(ExpectedConditions...)`).
3. **Soft Assertions for Non-Fatal Validations**: When verifying multiple independent fields (such as form validation states or reporting tables), use soft assertions (`expect.soft()`) to aggregate all failures in a single test run without aborting early.
4. **Custom Condition Polling**: Complex asynchronous states (such as background task completion or database updates) must be awaited using deterministic polling blocks (`expect.poll()`, `expect().toPass()`, `FluentWait`) with explicit timeouts and intervals.
5. **Clear Separation of Logic**: Assertions belong exclusively in test spec files and orchestration steps—never embedded invisibly inside page object interaction methods.

### Best Practices vs. Anti-Patterns

| Category                   | Best Practice                                                                           | Anti-Pattern                                                                                |
| :------------------------- | :-------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| **Synchronization**        | Use framework-native auto-retrying assertions (`toBeVisible()`, `should('have.text')`). | Adding hardcoded `sleep(3000)` waiting for animations or AJAX calls.                        |
| **DOM Verification**       | Assert on locator objects directly (`await expect(locator).toHaveValue('x')`).          | Extracting static text into a variable and asserting with generic `expect(text).toBe('x')`. |
| **Multi-Field Validation** | Use soft assertions (`expect.soft()`) to collect all field discrepancies.               | Single assertion failure masking 10 other broken fields on the page.                        |
| **Async Polling**          | Use `expect.poll()` or `toPass()` with explicit timeout and message.                    | Writing infinite `while (!condition)` loops without backoff or timeouts.                    |
| **Page Object Design**     | Return locators or state objects to spec files for assertion.                           | Embedding hardcoded assertions inside Page Object helper methods.                           |

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

To fetch complete, language-specific code implementations without context pollution, invoke `sdet-mcp` tools or read dynamic resources:

- **Playwright**: `read_pw_assertions_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URI: `playwright://assertions/{language}`
- **Cypress**: `read_cy_commands_docs` (Parameters: `language: "typescript" | "javascript"`) -> URI: `cypress://commands/{language}`
- **Selenium**: `read_se_waits_docs` (Parameters: `language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby"`) -> URI: `selenium://waits/{language}`
- **Vibium**: `read_vibium_core_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java"`) -> URI: `vibium://core/{language}`
