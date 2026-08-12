---
name: vibium-state-recording
description: 'Manage browser sessions, storage state snapshots, and execution recording in Vibium. Use when restoring authenticated session snapshots, managing multi-page contexts, or recording video and trace artifacts for debugging.'
user-invocable: true
license: MIT
compatibility: Vibium 26.x+
metadata:
  framework: vibium
  keywords:
    - vibium
    - storage-state
    - auth-snapshots
    - video-recording
    - session-tracing
    - multi-page-contexts
---

# Vibium State & Recording Management Architecture

## 1. What Is It?

A session lifecycle and artifact capture skill covering authentication state persistence (`storageState`), session trace capture, full-motion video recording, and multi-page/frame context isolation in Vibium.

## 2. Core Capabilities & Responsibilities

- **Authentication State Persistence**: Exports and restores cookies and storage state (`storageState`, `vibium storage`, `browser_storage_state`) to bypass repetitive UI login workflows.
- **Session Trace & Video Recording**: Packages execution timelines, DOM snapshots, network logs, and WebM video recordings into inspection archives.
- **Multi-Page & Tab Management**: Orchestrates multiple tabs, popups, and nested `<iframe>` hierarchies with isolated browser contexts.
- **Session Teardown & Hygiene**: Guarantees clean state teardowns and cookie isolation across parallel test workers.

## 3. Why Use It?

Accelerates test suite execution by caching authentication tokens, provides rich visual artifacts for debugging CI test failures, and eliminates state leakage between tests.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                               | Anti-Pattern                                                                 |
| :-------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **Auth State Reuse**: Cache storage state once and restore in test workers. | **Repetitive UI Logins**: Executing manual login forms before every test.    |
| **Ephemeral Contexts**: Allocate a fresh `newContext()` for each test.      | **Shared Global Page**: Running entire test suites on a single mutable page. |
| **Frame Locators**: Use scoped frame locators with auto-waiting.            | **Manual Frame Access**: Querying `iframe.contentWindow` via raw JS handles. |
| **Trace on Failure**: Preserve video/trace recordings only on failed runs.  | **Uncontrolled Video Storage**: Saving full video for all passing CI tests.  |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_vibium_state_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java`)
- **Resource URI**: `vibium://state/{language}`
