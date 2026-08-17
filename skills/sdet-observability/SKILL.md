---
name: sdet-observability
description: 'Use this skill when capturing execution traces, debugging CI test failures with Trace Viewer, configuring visual regression screenshot comparisons, or subscribing to browser console and network telemetry.'
user-invocable: true
license: MIT
metadata:
  capability: 'observability'
  frameworks: 'cypress,selenium,vibium,playwright'
---

# Test Observability, Trace Viewer & Visual Telemetry Architecture

## 1. Overview

Diagnosing why an automated test failed in a remote CI/CD pipeline without live observability is slow and error-prone. Modern SDET test architecture treats **Observability as a First-Class Citizen**, capturing comprehensive diagnostic artifacts upon failure or throughout execution.

Observability encompasses execution tracing (DOM snapshots, network logs, action metadata), video recordings, failure screenshots, visual regression diffing, browser console listeners, and unhandled exception telemetry.

## 2. Core Invariants & Universal Rules

1. **Retain-on-Failure Artifact Policy**: Always configure heavy artifacts (full video recordings and full traces) with `retain-on-failure` or `on-first-retry` in CI environments to optimize storage and pipeline speed.
2. **Deterministic Visual Regression**: Visual comparison assertions must use strict masking of dynamic content (timestamps, usernames, avatars, ads) and deterministic font rendering/viewports to prevent pixel flakiness.
3. **Continuous Console & Uncaught Exception Telemetry**: Test runners should monitor browser console warnings, network error responses (4xx/5xx), and uncaught JavaScript errors (`pageerror`, `console.error`) during test execution.
4. **Structured Error Logging**: Assertion failures must include meaningful context: target selector, actual vs expected values, page URL, and current viewport state.
5. **Trace Viewer Portability**: Tracing packages (such as Playwright `.zip` traces) must be standalone and shareable for instant post-mortem debugging.

### Best Practices vs. Anti-Patterns

| Category            | Best Practice                                                             | Anti-Pattern                                                             |
| :------------------ | :------------------------------------------------------------------------ | :----------------------------------------------------------------------- |
| **CI Artifacts**    | Capture full traces and videos only on test retry / failure.              | Saving 10GB of video artifacts for thousands of passing CI tests.        |
| **Visual Testing**  | Mask volatile UI elements (dates, badges) before diff comparison.         | Comparing entire unmasked pages that fail on minor timestamp ticks.      |
| **Console Errors**  | Assert zero unhandled `window.onerror` exceptions during test runs.       | Silently ignoring fatal front-end JavaScript errors in test output.      |
| **Failure Triage**  | Inspect step-by-step DOM snapshots and network timeline via Trace Viewer. | Relying purely on a one-line stack trace to diagnose remote CI failures. |
| **Telemetry Hooks** | Use lifecycle event listeners (`WebDriverListener`, `page.on`) for logs.  | Manually sprinkling `console.log` statements throughout test specs.      |

## 3. When to Use

- **When to Use**:
  - Configuring test tracing, video recording, and screenshot capture in CI/CD pipelines.
  - Investigating and debugging flaky or failing tests using step-by-step Trace Viewer artifacts.
  - Setting up pixel-level visual regression and snapshot testing with dynamic element masking.
  - Capturing browser console logs, network error telemetry, and uncaught exceptions.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Performing assertion checks on element visibility and state -> Use [sdet-assertions](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-assertions/SKILL.md).
  - Mocking network endpoints and handling responses -> Use [sdet-network](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-network/SKILL.md).
  - Designing Page Object Models and test lifecycle suites -> Use [sdet-authoring](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-authoring/SKILL.md).

## 4. Universal Framework Paradigm Mapping

| Automation Framework | Execution Tracing Engine                     | Visual Regression Engine               | Console & Network Telemetry                                   |
| :------------------- | :------------------------------------------- | :------------------------------------- | :------------------------------------------------------------ |
| **Playwright**       | `context.tracing` (`trace.zip` Trace Viewer) | `expect(page).toHaveScreenshot()`      | `page.on('console')`, `page.on('pageerror')`                  |
| **Cypress**          | Native Time-Travel Command Log               | `cy.screenshot()` + pixelmatch plugins | `cy.on('window:before:load')`, `cy.on('uncaught:exception')`  |
| **Selenium 4**       | OpenTelemetry spans (W3C tracing)            | AShot / Eyes / Selenium screenshot API | `EventFiringDecorator` & BiDi `driver.script.add_*_handler()` |
| **Vibium**           | BiDi action timeline recording               | Visual state comparison snapshots      | BiDi log/event subscriptions                                  |

## 5. Dynamic MCP Tool & Resource Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `sdet-mcp` tools or read dynamic resources:

- **Playwright**: `read_pw_observability_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URI: `playwright://observability/{language}`
- **Cypress**: `read_cy_commands_docs` (Parameters: `language: "typescript" | "javascript"`) -> URI: `cypress://commands/{language}`
- **Selenium**: `read_se_observability_docs`, `read_se_listeners_docs` (Parameters: `language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby"`) -> URIs: `selenium://observability/{language}`, `selenium://listeners/{language}`
- **Vibium**: `read_vibium_state_docs`, `read_vibium_bidi_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java"`) -> URIs: `vibium://state/{language}`, `vibium://bidi/{language}`
