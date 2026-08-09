---
name: vibium-interactions-actionability
description: 'Execute resilient web interactions with Vibium auto-waiting actionability checks (visible, stable, enabled, editable), keyboard shortcuts, and mouse gestures.'
user-invocable: true
license: MIT
compatibility: Vibium 1.0+ / BiDi
metadata:
  framework: vibium
  keywords:
    - vibium
    - interactions
    - actionability-checks
    - auto-waiting
    - form-inputs
    - gestures
---

# Vibium Interactions & Actionability Architecture

## 1. What Is It?

A low-level interaction and form manipulation skill leveraging Vibium's built-in multi-point actionability verification pipeline (attachment, visibility, stability, hit target, enabled, editable states).

## 2. Core Capabilities & Responsibilities

- **Multi-Point Actionability Pipeline**: Auto-awaits element attachment, viewport visibility, geometric stability, hit-test accessibility, enabled state, and input editability before firing events.
- **Atomic Form Controls**: Differentiates atomic `fill()` value replacement from physical keystroke emulation (`type()`), dropdown selection (`selectOption`), and file uploads (`setFiles`).
- **Idempotent State Management**: Enforces idempotent toggle methods (`check()`, `uncheck()`) that inspect state prior to firing interactions.
- **Complex Gestures & Input**: Dispatches drag-and-drop actions (`dragTo`), coordinate clicks, hover states, and keyboard modifier combinations.

## 3. Why Use It?

Eliminates flakiness and race conditions caused by animations, dynamic re-renders, slow network responses, and occluding overlay modals without requiring manual sleep statements.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                               | Anti-Pattern                                                                     |
| :-------------------------------------------------------------------------- | :------------------------------------------------------------------------------- |
| **Rely on Auto-Waiting**: Actions auto-await visibility and stability.      | **Arbitrary Sleep Delays**: Inserting `sleep(ms)` or fixed timer pauses.         |
| **Atomic `fill()` for Form Inputs**: Use `fill()` for fast form population. | **Slow Keystroke Loops**: Using `type()` everywhere without keystroke listeners. |
| **Idempotent Checkboxes**: Use `check()` / `uncheck()` for state toggles.   | **Unchecked `click()`**: Using raw clicks that toggle unknown checkbox state.    |
| **Direct File Uploads**: Pass file paths to file input locators.            | **OS File Dialog Automation**: Attempting to interact with native OS dialogs.    |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_vibium_interactions_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java`)
- **Resource URI**: `vibium://interactions/{language}`
