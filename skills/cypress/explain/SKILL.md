---
name: explain
description: 'Audit, explain, and critique existing Cypress test suites. Trigger on Cypress test code review, flakiness analysis, selector vulnerability audit, or anti-pattern detection.'
user-invocable: true
license: MIT
compatibility: Cypress 15.20+
metadata:
  framework: cypress
  keywords:
    - cypress
    - code-review
    - flakiness-audit
    - anti-patterns
    - spec-explanation
    - cypress-15
    - eslint-plugin-cypress
---

# Cypress Code Review & Anti-Pattern Analysis

## 1. What Is It?

A code review and diagnostic skill for reviewing, auditing, and explaining Cypress test suites against official Cypress core best practices and `eslint-plugin-cypress` rules.

## 2. Core Capabilities & Responsibilities

- **Flakiness Audit**: Detects arbitrary `cy.wait(5000)` sleeps, race conditions, and unhandled promise rejections.
- **Cypress 15.x Deprecation Analysis**: Identifies legacy `cy.end()` and `Cypress.env()` sync calls.
- **ESLint Rule Enforcement**: Audits code against `cypress/no-assigning-return-values`, `cypress/no-unnecessary-waiting`, `cypress/no-async-tests`, `cypress/unsafe-to-chain-command`, and `cypress/no-force`.
- **Architectural Best Practices**: Verifies `baseUrl` configuration and programmatic authentication setup.

## 3. Why Use It?

Used when auditing legacy Cypress test suites, onboarding team members, or debugging brittle tests to improve speed and test stability.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                  | Anti-Pattern                                                       |
| :------------------------------------------------------------- | :----------------------------------------------------------------- |
| **Wait on Aliased Routes**: `cy.wait('@getUsers')`             | **Arbitrary Sleep**: `cy.wait(5000)`                               |
| **Set `baseUrl` in Config**: `e2e: { baseUrl: '...' }`         | **Hardcoded Host URLs**: `cy.visit('http://localhost:3000/path')`  |
| **Programmatic Auth State**: `cy.session()` or `cy.request()`  | **UI Login in Every Spec**: Repeating UI login steps in every spec |
| **Start Fresh Chains**: Start new `cy.get()` query             | **Deprecated `cy.end()`**: Using `.end()` to break chains          |
| **Use `.then()` Closures**: `cy.get('.el').then(($el) => ...)` | **Variable Assignment**: `const btn = cy.get('button')`            |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_cy_commands_docs`, `read_cy_network_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
