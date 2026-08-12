---
name: cypress-retryability-assertions
description: 'Leverage Cypress automatic retry-ability and condition-based assertion synchronization. Use when asserting DOM states, adjusting assertion timeouts, or eliminating arbitrary cy.wait(ms) delays.'
user-invocable: true
license: MIT
compatibility: Cypress 15.x+
metadata:
  framework: cypress
  keywords:
    - cypress
    - retry-ability
    - assertions
    - dynamic-waiting
    - flakiness-prevention
---

# Cypress Retry-ability & Assertion Mechanics

## 1. What Is It?

A dynamic waiting and assertion mechanics skill covering Cypress's automatic query retries and Chai assertion chaining.

## 2. Core Capabilities & Responsibilities

- **Implicit Retry-ability**: Leverages `defaultCommandTimeout` automatic retry mechanics until assertions pass.
- **Assertion Types**: Distinguishes implicit Chai assertions (`.should('be.visible')`) from explicit `.then()` assertions.
- **Arbitrary Wait Elimination**: Replaces wasteful `cy.wait(ms)` calls with dynamic condition polling and route aliasing.

## 3. Why Use It?

Eliminates test flakiness and speeds up test execution cycles by relying on dynamic DOM assertions instead of hardcoded sleeps.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                               | Anti-Pattern                                              |
| :-------------------------------------------------------------------------- | :-------------------------------------------------------- |
| **Dynamic Assertion Retries**: `cy.get('.loader').should('not.exist')`      | **Arbitrary Sleep**: `cy.wait(5000)`                      |
| **Route Alias Waiting**: `cy.wait('@getUsers')`                             | **Fixed Timer Waits**: `cy.wait(3000)` after button click |
| **Chained Chai Assertions**: `.should('be.visible').and('not.be.disabled')` | **Detached Sync Assertions**: Asserting on stale elements |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_cy_commands_docs`, `read_cy_network_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
