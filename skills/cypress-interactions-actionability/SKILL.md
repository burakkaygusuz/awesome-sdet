---
name: cypress-interactions-actionability
description: 'Guidelines for user interaction commands, actionability safety checks, eliminating force options, and scroll behaviors in Cypress.'
user-invocable: true
license: MIT
compatibility: Cypress 15.x+
metadata:
  framework: cypress
  keywords:
    - cypress
    - user-interactions
    - actionability-checks
    - element-actions
    - scroll-behavior
    - no-force
---

# Cypress User Interactions & Actionability Checks

## 1. What Is It?

A DOM action command skill focusing on automatic actionability safety checks (`.click()`, `.type()`, `.check()`, `.select()`) and `cypress/no-force` compliance.

## 2. Core Capabilities & Responsibilities

- **Actionability Verification**: Verifies element attachment, visibility, animation status, enabled status, and overlay coverage.
- **`cypress/no-force` Compliance**: Replaces `{ force: true }` workarounds with `selectFile()` or modal backdrop assertions.
- **Scroll Alignment**: Explains automatic element scrolling into view before executing user interactions.

## 3. Why Use It?

Ensures interaction commands accurately model true end-user capability rather than bypassing browser security and visibility constraints.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                              | Anti-Pattern                                                                  |
| :------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Verify Visibility First**: `cy.get('.btn').should('be.visible').click()` | **Bypass Actionability**: `cy.get('.btn').click({ force: true })`             |
| **File Input `selectFile()`**: `cy.get('input').selectFile('file.pdf')`    | **Forced Input Click**: `cy.get('input[type="file"]').click({ force: true })` |
| **Wait for Overlay Removal**: `cy.get('.modal').should('not.exist')`       | **Clicking Under Modal**: Firing actions while modal overlay is active        |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_cy_commands_docs`, `read_cy_fixtures_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
