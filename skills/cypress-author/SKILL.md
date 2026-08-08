---
name: cypress-author
description: 'Author, update, and fix Cypress E2E and Component tests. Trigger on Cypress test creation, spec refactoring, data-cy selector practices, custom commands, or fixing failing specs.'
user-invocable: true
license: MIT
compatibility: Cypress 15.20+
metadata:
  framework: cypress
  keywords:
    - cypress
    - e2e-testing
    - component-testing
    - data-cy
    - custom-commands
    - spec-authoring
---

# Cypress Test Authoring & Spec Refactoring

## 1. What Is It?

A comprehensive workflow skill for authoring, updating, and repairing Cypress End-to-End (E2E) and Component tests following official Cypress best practices.

## 2. Core Capabilities & Responsibilities

- **Project Inspection**: Analyzes `cypress.config.ts`, `cypress/support/commands.ts`, and fixtures before generating test code.
- **Resilient DOM Selectors**: Enforces `data-cy` / `data-testid` priority hierarchies over brittle CSS or XPath routes.
- **Component & E2E Testing**: Authors both E2E test specs and multi-framework Component tests (React, Vue, Angular, Svelte).
- **Programmatic State Control**: Bypasses UI login flows by setting auth state via `cy.session()` or `cy.request()`.

## 3. Why Use It?

Used to generate maintainable, production-ready Cypress specs that adhere to team conventions rather than generic or brittle test scripts.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                            | Anti-Pattern                                                                  |
| :----------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Set `baseUrl` in Config**: `e2e: { baseUrl: 'http://localhost:3000' }` | **Hardcoded URLs in Specs**: `cy.visit('http://localhost:3000/login')`        |
| **Use `data-cy` Selectors**: `cy.get('[data-cy="submit-btn"]')`          | **Brittle CSS Paths**: `cy.get('div > span:nth-child(2)')`                    |
| **Programmatic Auth State**: `cy.session()` or `cy.request()`            | **UI Login in Every Spec**: Navigating through full UI login in every test    |
| **Asynchronous `cy.env('KEY')`**: Use `cy.env('API_KEY').then(...)`      | **Deprecated `Cypress.env()`**: Synchronous environment variable access       |
| **Reuse Custom Commands**: Utilize `cy.getBySel('submit')`               | **Duplicated Query Boilerplate**: Re-writing custom DOM queries in every spec |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_cy_commands_docs`, `read_cy_component_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
