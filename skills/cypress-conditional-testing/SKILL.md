---
name: cypress-conditional-testing
description: 'Strategies for handling dynamic application state, avoiding flaky conditional testing anti-patterns in Cypress.'
user-invocable: true
license: MIT
compatibility: Cypress 15.20+
metadata:
  framework: cypress
  keywords:
    - cypress
    - conditional-testing
    - dynamic-ui
    - deterministic-tests
    - state-management
---

# Cypress Conditional Testing & Deterministic State Management

## 1. What Is It?

A test design architecture skill covering deterministic state control and strategies for avoiding conditional testing anti-patterns on dynamic DOM elements.

## 2. Core Capabilities & Responsibilities

- **Deterministic Server Control**: Uses `cy.task('seedDatabase')` or `cy.intercept()` to force fixed API responses.
- **Session State Control**: Utilizes `cy.session()` or cookie setters to enforce predictable authentication state.
- **Flakiness Prevention**: Explains why checking DOM state with `if ($body.find('.modal').length)` leads to non-deterministic tests.

## 3. Why Use It?

Used to eliminate non-deterministic test failures caused by asynchronous UI rendering and unpredictable backend data state.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                      | Anti-Pattern                                                                |
| :--------------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| **Stub Server Responses**: `cy.intercept('GET', '/api', { fixture: 'data.json' })` | **Dynamic DOM `if` Statements**: `if ($body.find('.el').length)`            |
| **Reset DB via `cy.task()`**: `cy.task('resetDatabase')` in `beforeEach()`         | **Shared Test State**: Test B relying on Test A's DB side-effects           |
| **Isolated Auth via `cy.session()`**: `cy.session('user', () => ...)`              | **Re-logging in Every Test**: Re-executing UI login steps before every spec |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_cy_session_docs`, `read_cy_task_docs`, `read_cy_network_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
