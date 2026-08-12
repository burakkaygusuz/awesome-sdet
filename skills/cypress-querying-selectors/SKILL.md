---
name: cypress-querying-selectors
description: 'Query and scope DOM elements using resilient selector hierarchies and accessibility attributes in Cypress. Use when targeting elements with data-* attributes, traversing nested DOM structures, or querying inside iframes.'
user-invocable: true
license: MIT
compatibility: Cypress 15.x+
metadata:
  framework: cypress
  keywords:
    - cypress
    - dom-querying
    - data-cy
    - parent-child-scoping
    - iframe-testing
---

# Cypress DOM Querying & Selector Best Practices

## 1. What Is It?

A DOM selection and element querying skill focused on selector resiliency, parent-child scoping (`.within()`), and iframe traversal.

## 2. Core Capabilities & Responsibilities

- **Selector Priority Hierarchy**: Enforces `data-cy` / `data-testid` > `cy.contains()` > form IDs > brittle CSS paths.
- **Scoped Querying**: Demonstrates parent container filtering using `.within(() => { ... })`.
- **Iframe Traversal**: Outlines same-origin iframe content document access and body wrapping via `cy.wrap()`.

## 3. Why Use It?

Used to ensure tests do not break during UI restyling, CSS framework migrations, or DOM restructuring.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                             | Anti-Pattern                                                          |
| :------------------------------------------------------------------------ | :-------------------------------------------------------------------- |
| **Dedicated Test Attributes**: `cy.get('[data-cy="submit-btn"]')`         | **Deep Brittle Paths**: `cy.get('div > table > tr > td:first-child')` |
| **Container Scoping**: `cy.get('.card').within(() => ...)`                | **Global Re-querying**: Re-querying document root inside loops        |
| **Same-Origin `its()` Traversal**: `iframe.its('0.contentDocument.body')` | **Hardcoded Iframe Sleep**: `cy.wait(3000)` before iframe access      |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_cy_commands_docs`, `read_cy_shadow_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
