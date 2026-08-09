---
name: selenium-actions-api
description: 'Low-level virtualized user interactions (mouse hover, context click, drag & drop, keyboard shortcuts, scroll wheel). Trigger on Actions API, ActionChains, or pointer input.'
user-invocable: true
license: MIT
compatibility: Selenium 4.x+
metadata:
  framework: selenium
  keywords:
    - actions-api
    - action-chains
    - virtual-user-input
    - drag-and-drop
    - context-click
    - mouse-hover
    - scroll-wheel
---

# Actions API — Low-Level User Interactions

## 1. What Is It?

The Selenium Actions API provides a low-level interface for transmitting virtualized device input actions (mouse, keyboard, touch, scroll wheel) to the web browser.

## 2. Core Capabilities & Responsibilities

- **Complex Pointer Interactions**: Executes mouse hover (`moveToElement`), context click (`contextClick`), double click (`doubleClick`), and drag-and-drop (`dragAndDrop`) sequences.
- **Keyboard Shortcuts & Modifier Keys**: Triggers key combinations using modifier keys (Ctrl/Cmd/Shift) and text selection shortcuts (Ctrl+A).
- **Scroll Wheel Input**: Manages page scrolling, infinite scroll lists, and element alignment via `scrollToElement`.

## 3. Why Use It?

Used to simulate real user interactions with 100% fidelity when high-level element methods (e.g., `click()`, `sendKeys()`) are insufficient. Action commands are built declaratively and dispatched in a single batch request upon calling `.perform()`.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                     | Anti-Pattern                                                                                                     |
| :------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------- |
| **Chain with `.perform()`**: Always append `.perform()` at the end of an action sequence.         | **Forgotten Execution**: Omitting `.perform()` prevents actions from executing.                                  |
| **Use Composite Methods**: Prefer built-in helper methods like `dragAndDrop(source, target)`.     | **Manual Click-and-Drag**: Calculating manual mouse coordinates when composite helpers exist.                    |
| **Align to Viewport**: Scroll target elements into view via `scrollToElement` before interaction. | **Off-Screen Interaction**: Attempting pointer clicks on non-visible elements causing click interception errors. |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_se_actions_docs`
- **Parameters**: `language` (`java` | `python` | `typescript` | `javascript` | `csharp` | `ruby`)
