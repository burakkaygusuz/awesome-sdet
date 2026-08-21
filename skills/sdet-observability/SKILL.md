---
name: sdet-observability
description: 'Use this skill when configuring test execution tracing, debugging CI test failures with Trace Viewer, setting up visual regression screenshot testing, or capturing browser console and network telemetry, even if not explicitly mentioned.'
user-invocable: true
license: MIT
metadata:
  capability: 'observability'
  frameworks: 'cypress,selenium,vibium,playwright'
---

# Test Observability, Trace Viewer & Visual Telemetry Architecture

## 1. Overview

Observability treats test diagnostics (DOM snapshots, network logs, video recordings, visual diffs, console errors) as first-class artifacts to enable rapid root-cause analysis of CI failures.

## 2. Core Invariants & Universal Rules

1. **Retain-on-Failure CI Artifacts**: Configure heavy execution traces and video recordings with `retain-on-failure` or `on-first-retry` in CI pipelines, because recording and saving full media for thousands of passing tests wastes gigabytes of CI storage and slows test execution.
2. **Mask Volatile Elements in Visual Diffs**: Mask dynamic UI elements (timestamps, user avatars, live counters, banner ads) during screenshot comparisons, because minor data changes cause false-positive visual regression failures.
3. **Continuous Console & Exception Monitoring**: Listen for uncaught browser exceptions (`pageerror`, `window.onerror`) and unexpected console errors during test execution, because frontend JavaScript errors often indicate hidden regressions even when UI assertions pass.
4. **Structured Failure Diagnostics**: Include the target selector, expected vs actual values, page URL, and current viewport in assertion error messages to enable immediate root-cause diagnosis without re-running tests locally.
5. **Self-Contained Tracing Packages**: Export portable trace archives (e.g. Playwright `.zip` traces) that include DOM snapshots, action timelines, and network logs for post-mortem triage.

### Gotchas & Critical Traps

- **Font Rendering Differences Across OS**: Visual regression screenshots taken on macOS differ from Linux CI runners due to subpixel font antialiasing; always generate baseline screenshots in Docker or matching CI containers.
- **Console Listener Timing**: Attaching `page.on('console')` after `page.goto()` misses console logs emitted during initial page bootstrapping and hydration.
- **Trace File Size Explosion**: Tracing with full screenshot and snapshot capture on long-running workflows can generate multi-hundred megabyte trace files; scope tracing tightly around critical test steps.

## 3. Step-by-Step Workflow

1. **Configure CI Telemetry Policies**: Set tracing and video capture to `retain-on-failure` or `on-first-retry` to avoid storage bloat.
2. **Attach Console & Error Listeners**: Register `pageerror` and console handlers before navigation to capture hydration issues.
3. **Mask Volatile Regions**: Mask dynamic timestamps, IDs, and avatars during visual screenshot comparisons.
4. **Export Structured Artifacts**: Save `.zip` traces or diagnostic reports and verify via `verify_test_artifact`.

## 4. When to Use

- **When to Use**:
  - Configuring test tracing, video recording, and screenshot capture in CI/CD pipelines.
  - Investigating and debugging flaky or failing tests using step-by-step Trace Viewer artifacts.
  - Setting up pixel-level visual regression and snapshot testing with dynamic element masking.
  - Capturing browser console logs, network error telemetry, and uncaught exceptions.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Performing assertion checks on element visibility and state -> Use [sdet-assertions](../sdet-assertions/SKILL.md).
  - Mocking network endpoints and handling responses -> Use [sdet-network](../sdet-network/SKILL.md).
  - Designing Page Object Models and test lifecycle suites -> Use [sdet-authoring](../sdet-authoring/SKILL.md).

## 5. Universal Framework Paradigm Mapping

| Automation Framework | Execution Tracing Engine                     | Visual Regression Engine               | Console & Network Telemetry                                   |
| :------------------- | :------------------------------------------- | :------------------------------------- | :------------------------------------------------------------ |
| **Playwright**       | `context.tracing` (`trace.zip` Trace Viewer) | `expect(page).toHaveScreenshot()`      | `page.on('console')`, `page.on('pageerror')`                  |
| **Cypress**          | Native Time-Travel Command Log               | `cy.screenshot()` + pixelmatch plugins | `cy.on('window:before:load')`, `cy.on('uncaught:exception')`  |
| **Selenium 4**       | OpenTelemetry spans (W3C tracing)            | AShot / Eyes / Selenium screenshot API | `EventFiringDecorator` & BiDi `driver.script.add_*_handler()` |
| **Vibium**           | BiDi action timeline recording               | Visual state comparison snapshots      | BiDi log/event subscriptions                                  |

## 6. Dynamic MCP Knowledge & Tool Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `read_sdet_docs`:

- **Playwright Observability**: When capturing traces, screenshots, or console logs in Playwright, invoke `read_sdet_docs({ framework: "playwright", domain: "observability", language: "typescript" | "javascript" | "python" | "java" | "csharp" })`.
- **Cypress Observability**: When configuring Cypress screenshots, logs, or error hooks, invoke `read_sdet_docs({ framework: "cypress", domain: "commands", language: "typescript" | "javascript" })`.
- **Selenium Observability**: When configuring OpenTelemetry spans, WebDriver listeners, or BiDi logging in Selenium 4, invoke `read_sdet_docs({ framework: "selenium", domain: "observability" | "listeners", language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby" })`.
- **Vibium State & BiDi Tracing**: When recording action timelines or capturing state in Vibium, invoke `read_sdet_docs({ framework: "vibium", domain: "state" | "bidi", language: "typescript" | "javascript" | "python" | "java" })`.

Universal quality invariants and execution rules are accessible via `sdet://guidelines` and `sdet://invariants`.

## 7. Verification Checklist

- [ ] Tracing configured with `retain-on-failure` to prevent CI resource exhaustion.
- [ ] Volatile dynamic elements masked during visual snapshot assertions.
- [ ] Uncaught errors monitored via listeners without swallowing exceptions.
- [ ] Validated via `verify_test_artifact({ code, framework, language })` with 100/100 score.
