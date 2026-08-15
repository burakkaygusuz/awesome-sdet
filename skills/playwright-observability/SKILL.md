---
name: playwright-observability
description: 'Record full execution traces, inspect runs with Playwright Trace Viewer, capture WebP visual snapshots, and collect runtime telemetry.'
user-invocable: true
license: MIT
compatibility: Playwright 1.x+
metadata:
  framework: playwright
  keywords:
    - playwright
    - tracing
    - trace-viewer
    - observability
    - screenshots
    - webp
    - video
    - telemetry
    - console-logs
    - dialogs
---

# Observability, Tracing & Artifacts

## 1. What Is It?

Playwright provides industry-leading runtime observability and debugging tools centered around the **Playwright Trace Viewer**. Tracing instruments live browser execution to record full DOM snapshots, network waterfalls, action timings, source code locations, console outputs, and screen screencasts into a single, portable `trace.zip` archive.

In addition, Playwright provides native APIs for WebP/PNG visual comparison snapshots, headless video recording, and console/dialog event streaming.

## 2. Core Capabilities & Responsibilities

- **Full Execution Tracing (`context.tracing.start/stop`)**:
  - `screenshots: true`: Captures in-browser screencast snapshots for timeline scrubbing.
  - `snapshots: true`: Captures full DOM state before and after every action with live element inspector.
  - `sources: true`: Embeds test source files highlighting the exact line of execution.
- **CI-Optimized Tracing Policies**:
  - `trace: 'on-first-retry'`: Captures traces only when a test fails and is retried, avoiding CI storage bloat.
  - `trace: 'retain-on-failure'`: Preserves trace archives exclusively for failed test runs.
- **Visual Regression Snapshots (`expect(page).toHaveScreenshot()`)**: Compares rendered pixels against golden reference snapshots with configurable tolerance thresholds and native `.webp` / `.png` formatting.
- **Video & Screenshot Artifacts**: Captures full-session MP4/WebM videos (`video: 'on'`) and viewport/locator screenshots (`page.screenshot()`, `locator.screenshot()`).
- **Telemetry Event Listeners**:
  - `page.on('console', msg => ...)`: Collects browser console logs, warnings, and errors.
  - `page.on('pageerror', err => ...)`: Intercepts unhandled JavaScript exceptions.
  - `page.on('dialog', dialog => dialog.accept())`: Automatically handles native alert, confirm, and prompt dialogs.

## 3. Why Use It?

Debugging intermittent test failures in remote CI environments using plain console text logs is tedious and inefficient. Playwright Traces eliminate "cannot reproduce locally" issues by providing a full, step-by-step interactive time machine of the exact browser run.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                           | Anti-Pattern                                                                                                   |
| :------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------------------------------- |
| **Use `on-first-retry` in CI**: Record traces on retries to optimize CI execution time and disk quota.  | **Traces Enabled for 100% of Green Tests**: Generating gigabytes of redundant trace archives for passing runs. |
| **Inspect via Trace Viewer**: Open traces with `npx playwright show-trace trace.zip` for investigation. | **Guess-and-Check Debugging**: Adding arbitrary sleeps and guessing what failed from terminal text logs.       |
| **Automate Dialog Handlers**: Register `page.on('dialog')` before triggering modals.                    | **Hanging Dialogs**: Forgetting dialog handlers, causing actions to stall waiting for user input.              |
| **Mask Dynamic Content in Visual Diffs**: Pass `{ mask: [locator] }` over clocks, avatars, or ads.      | **Unmasked Dynamic Visual Tests**: Visual comparison tests constantly failing due to changing timestamps.      |
| **Export Traces as CI Artifacts**: Upload `test-results/` on build failures.                            | **Discarding CI Failure Artifacts**: Leaving developers with no diagnostic artifacts on CI failures.           |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_pw_observability_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java` | `csharp`)
- **Resource URI**: `playwright://observability/{language}`
