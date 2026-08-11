---
name: cypress-docs
description: 'Retrieve up-to-date, grounded official Cypress documentation and code examples. Trigger on Cypress API lookups, syntax queries, or verifying Cypress command signatures.'
user-invocable: true
license: MIT
compatibility: Cypress 15.x+
metadata:
  framework: cypress
  keywords:
    - cypress
    - documentation
    - mcp-tools
    - api-reference
---

# Cypress Documentation Grounding & MCP Retrieval

## 1. What Is It?

A documentation retrieval and API grounding skill that connects AI agents to the authoritative `sdet-mcp` Cypress server tools.

## 2. Core Capabilities & Responsibilities

- **Grounding Against Hallucinations**: Provides official signatures for `cy.intercept`, `cy.session`, `cy.origin`, and `mount()`.
- **Language-Matched Examples**: Delivers 1:1 idiomatic TypeScript or JavaScript code snippets.
- **Complete Domain Coverage**: Covers commands, network, session, component testing, fixtures, shadow DOM, stubs, spies, and tasks.

## 3. Why Use It?

Used whenever an AI agent requires official Cypress API documentation or syntax examples to prevent API hallucinations and syntax mistakes.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                   | Anti-Pattern                                                            |
| :------------------------------------------------------------------------------ | :---------------------------------------------------------------------- |
| **Query `sdet-mcp` Tools**: `read_cy_commands_docs({ language: 'typescript' })` | **Hallucinating Signatures**: Guessing non-existent Cypress methods     |
| **Specify Language Context**: Pass `language: 'typescript'` or `'javascript'`   | **Unformatted Snippets**: Mixing untyped JavaScript in TypeScript specs |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tools**: `read_cy_commands_docs`, `read_cy_network_docs`, `read_cy_session_docs`, `read_cy_component_docs`, `read_cy_shadow_docs`, `read_cy_task_docs`, `read_cy_stubs_spies_docs`, `read_cy_fixtures_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
