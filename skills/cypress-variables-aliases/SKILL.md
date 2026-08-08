---
name: cypress-variables-aliases
description: "Master Cypress element and network request aliasing (.as('alias')), closure scoping, and avoiding JavaScript variable mutation anti-patterns."
user-invocable: true
license: MIT
compatibility: Cypress 15.20+
metadata:
  framework: cypress
  keywords:
    - cypress
    - aliasing
    - variables
    - closure-scoping
    - network-aliases
---

# Cypress Variables, Aliases & Closure Scoping

## 1. What Is It?

A state management and reference handling skill for element and route aliasing (`.as()`), network interception, and closure scoping.

## 2. Core Capabilities & Responsibilities

- **Element Aliasing**: Stores DOM references via `cy.get().as('myEl')` and re-queries via `@myEl`.
- **Network Interception Aliasing**: Aliases HTTP requests `cy.intercept(...).as('apiReq')` and awaits them via `cy.wait('@apiReq')`.
- **`cypress/no-assigning-return-values` Enforcement**: Prevents assigning `cy` return values to JavaScript variables.

## 3. Why Use It?

Used to share data between hooks and test steps safely without mutating global variables or creating race conditions.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                               | Anti-Pattern                                                             |
| :-------------------------------------------------------------------------- | :----------------------------------------------------------------------- |
| **Alias DOM Elements**: `cy.get('button').as('btn')`                        | **Assign `cy` to Const**: `const btn = cy.get('button')`                 |
| **Alias & Wait Intercepts**: `cy.intercept().as('req')` + `cy.wait('@req')` | **Un-aliased Intercepts**: Firing network calls without waiting on alias |
| **Use `.then()` Closures**: `cy.get('.val').then(($el) => ...)`             | **Mutating Outer Scope Vars**: `let val; cy.get().then(x => val = x)`    |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_cy_commands_docs`, `read_cy_network_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
