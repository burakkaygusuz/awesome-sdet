---
name: selenium-bidi
description: 'W3C WebDriver BiDirectional (BiDi) protocol features: console log inspection, network interception, and browsing context. Trigger on BiDi, LogInspector, network mocking, or WebSocket events.'
user-invocable: true
license: MIT
compatibility: Selenium 4.x+
metadata:
  framework: selenium
  keywords:
    - webdriver-bidi
    - log-inspector
    - network-interception
    - browsing-context
    - websocket-events
---

# WebDriver BiDi Protocol Architecture

## 1. What Is It?

WebDriver BiDi (Bidirectional) is the W3C standard protocol enabling bidirectional, real-time, event-driven communication between test automation scripts and web browsers over WebSockets.

## 2. Core Capabilities & Responsibilities

- **Console & Error Inspection (`LogInspector`)**: Listens to live browser console entries, JavaScript exceptions, and system warnings.
- **Network Interception (`Network Intercept`)**: Captures and mutates HTTP requests and responses, modifies headers, and fulfills authentication challenges.
- **Browsing Context Management**: Monitors window/tab lifecycle events, inspects context trees, and captures element-level screenshots.

## 3. Why Use It?

Eliminates the polling overhead inherent in standard HTTP request-response WebDriver commands. Provides cross-browser support across Chrome, Edge, and Firefox without relying on browser-specific CDP (Chrome DevTools Protocol) endpoints.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                       | Anti-Pattern                                                                                    |
| :-------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Enable BiDi Capability**: Set `webSocketUrl = true` on browser options prior to session creation. | **Unset Capability**: Invoking BiDi modules without enabling WebSocket URLs in session options. |
| **Prefer BiDi Standard**: Use W3C BiDi protocol features over browser-specific CDP APIs.            | **CDP Vendor Lock-In**: Depending on CDP commands that break on non-Chromium browsers.          |
| **Clean Up Listeners**: Detach event handlers during test teardown.                                 | **Memory Leaks**: Leaving event listeners open in persistent browser sessions.                  |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_se_bidi_docs`
- **Parameters**: `language` (`java` | `python` | `typescript` | `javascript` | `csharp` | `ruby`)
