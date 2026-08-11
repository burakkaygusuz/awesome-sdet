---
name: cypress-core-concepts
description: 'Master Cypress core architecture, asynchronous command queue execution, chainable subjects, and Promise anti-patterns.'
user-invocable: true
license: MIT
compatibility: Cypress 15.x+
metadata:
  framework: cypress
  keywords:
    - cypress
    - core-architecture
    - command-queue
    - async-chaining
    - promise-anti-patterns
    - cypress-15
---

# Cypress Core Concepts & Asynchronous Execution Architecture

## 1. What Is It?

A core architecture skill detailing Cypress's serial command queue execution model, subject chaining rules, and asynchronous lifecycle mechanics.

## 2. Core Capabilities & Responsibilities

- **Serial Queue Execution**: Explains why Cypress commands cannot be awaited with native JavaScript `async/await`.
- **Subject Pass-Through**: Details how query commands yield DOM subjects and action commands pass original subjects down the chain.
- **Cypress 15.x API Standards**: Enforces modern async `cy.env('KEY')` commands over deprecated `Cypress.env()`.

## 3. Why Use It?

Essential for understanding Cypress's execution loop, avoiding Promise anti-patterns, and structuring deterministic command chains.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                   | Anti-Pattern                                                      |
| :-------------------------------------------------------------- | :---------------------------------------------------------------- |
| **Serial Command Chaining**: `cy.get('button').click()`         | **Awaiting `cy` Commands**: `await cy.get('button')`              |
| **Async `cy.env()` Access**: `cy.env('KEY').then((val) => ...)` | **Sync `Cypress.env()` Access**: `const val = Cypress.env('KEY')` |
| **Chain Query Off `cy`**: Start fresh `cy.get()` chain          | **Deprecated `cy.end()`**: Using `.end()` to break chains         |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_cy_commands_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
