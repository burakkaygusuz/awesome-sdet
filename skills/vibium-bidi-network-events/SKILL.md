---
name: vibium-bidi-network-events
description: 'Leverage WebDriver BiDi protocol features in Vibium: real-time WebSocket event streams, network request interception/mocking, console logs, and clock virtualization.'
user-invocable: true
license: MIT
compatibility: Vibium 26.x+
metadata:
  framework: vibium
  keywords:
    - vibium
    - webdriver-bidi
    - network-interception
    - request-mocking
    - console-listeners
    - clock-virtualization
---

# Vibium WebDriver BiDi & Network Events Architecture

## 1. What Is It?

A protocol-level automation skill leveraging the W3C WebDriver BiDi (Bidirectional) WebSocket standard for real-time network interception, event streaming, and virtual clock manipulation in Vibium.

## 2. Core Capabilities & Responsibilities

- **Bidirectional Event Streams**: Subscribes to real-time browser telemetry (`console`, `pageerror`, `dialog`, `download`) without HTTP polling overhead.
- **Network Interception & Route Mocking**: Intercepts HTTP/HTTPS requests via `page.route` to synthetically fulfill responses (`route.fulfill`), mutate headers (`route.continue`), or abort trackers (`route.abort`).
- **Clock Virtualization**: Manipulates virtual timers (`clock.install`, `clock.fastForward`, `clock.setFixedTime`, `clock.setTimezone`) for instant time-based test execution.
- **Modal Dialog Handling**: Handles JavaScript dialogs (`alert`, `confirm`, `prompt`) asynchronously via event subscriptions.

## 3. Why Use It?

Enables deterministic API mocking, eliminated flaky timer waits, real-time error logging, and cross-browser BiDi compatibility across Chromium and Firefox without proprietary CDP lock-in.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                        | Anti-Pattern                                                                  |
| :----------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Clean Up Routes**: Detach route handlers and listeners during test teardown.       | **Leaked Network Routes**: Leaving mock routes active across isolated tests.  |
| **Virtual Clock for Timers**: Fast-forward timers with `clock.fastForward()`.        | **Real-Time Delays**: Waiting 60s in real time for countdown timers.          |
| **Attach Dialog Listeners First**: Set up dialog handlers before triggering actions. | **Hanging Dialogs**: Firing dialog actions without listeners.                 |
| **Precise URL Matching**: Use specific glob or regex patterns in `route`.            | **Catch-All Wildcards**: Routing `*` without fallback breaking static assets. |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_vibium_bidi_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java`)
- **Resource URI**: `vibium://bidi/{language}`
