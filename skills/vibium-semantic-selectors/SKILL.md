---
name: vibium-semantic-selectors
description: 'Target web elements using accessible semantic locators and Shadow DOM combinators in Vibium. Use when querying by role, accessible text, label, testid, or piercing Shadow DOM boundaries with >> and >>>.'
user-invocable: true
license: MIT
compatibility: Vibium 26.x+
metadata:
  framework: vibium
  keywords:
    - vibium
    - semantic-selectors
    - role-locators
    - shadow-dom
    - pierce-combinators
    - subtree-scoping
---

# Vibium Semantic Selectors & Shadow DOM Piercing Architecture

## 1. What Is It?

A DOM querying and element location skill focused on user-facing accessibility semantics (`role`, `label`, `text`, `testid`) and native open Shadow DOM pierce combinators (`>>`, `>>>`) in Vibium.

## 2. Core Capabilities & Responsibilities

- **Accessibility-First Hierarchy**: Prioritizes ARIA roles and accessible names (`role`, `label`, `placeholder`) over fragile CSS class chains or absolute XPath indexes.
- **Shadow DOM Piercing**: Traverses encapsulated Web Component boundaries via single-hop (`>>`) and deep recursive (`>>>`) pierce combinators.
- **Subtree Scoping**: Restricts element search contexts to parent containers (`scope`, `element.find`) to eliminate ambiguous multi-match collisions.
- **Semantic CLI & Tool Integration**: Supports semantic CLI subcommands (`vibium find role/text/label`) and SDK locator objects.

## 3. Why Use It?

Ensures test scripts remain resilient against UI redesigns, styling overhauls, CSS framework refactors, and shadow-root DOM encapsulations.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                 | Anti-Pattern                                                                       |
| :---------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **Use Semantic Locators**: Locate via ARIA role and accessible name.          | **Brittle CSS Classes**: Relying on auto-generated or utility CSS class names.     |
| **Pierce Shadow Roots**: Use `>>` or `>>>` combinators for Web Components.    | **Manual JS Shadow Queries**: Evaluating `el.shadowRoot.querySelector()` manually. |
| **Container Scoping**: Scope searches to parent container elements.           | **Global Fragile XPath**: Using absolute paths like `/html/body/div[2]/...`.       |
| **Dedicated Test IDs**: Use `testid` for complex canvas or unlabeled widgets. | **Dynamic ID Selectors**: Binding to dynamic framework IDs (e.g., `#el-1234`).     |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_vibium_selectors_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java`)
- **Resource URI**: `vibium://selectors/{language}`
