---
name: cypress-web-security-origin
description: 'Master Cypress cross-origin testing (cy.origin), same-origin policy, iframe isolation, and multi-domain authentication.'
user-invocable: true
license: MIT
compatibility: Cypress 15.x+
metadata:
  framework: cypress
  keywords:
    - cypress
    - cy-origin
    - web-security
    - cross-domain
    - multi-domain-auth
---

# Cypress Web Security & Multi-Origin Testing (`cy.origin`)

## 1. What Is It?

A multi-domain testing and web security skill covering `cy.origin()`, same-origin policy boundaries, and OAuth authentication flows.

## 2. Core Capabilities & Responsibilities

- **Multi-Domain Navigation**: Navigates across super-domain boundaries (e.g. `app.example.com` to `auth0.com`) using `cy.origin()`.
- **Spec-Bridge Lifecycle**: Manages secondary origin context execution, argument passing, and automatic return to primary origin context.
- **Same-Origin Policy Isolation**: Handles cookie domain scopes, local storage boundaries, and iframe security restrictions.

## 3. Why Use It?

Required whenever tests need to interact with third-party OAuth authentication providers (Auth0, Okta, Google Login) or external payment gateways across different super-domains.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                             | Anti-Pattern                                                                              |
| :---------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **Wrap Third-Party Domain in `cy.origin()`**: `cy.origin('https://auth0.com', () => ...)` | **Direct `cy.get()` Across Origins**: Querying non-origin domain directly                 |
| **Pass Args to Callback**: `cy.origin(url, { args: { user } }, ({ user }) => ...)`        | **Referencing Outer Scope Variables**: Direct access to outer JS scope in `cy.origin`     |
| **Return to Primary Origin**: Automatic context restoration upon callback exit            | **Disabling Web Security Globally**: Turning off `chromeWebSecurity: false` unnecessarily |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_cy_session_docs`
- **Parameters**: `language` (`typescript` | `javascript`)
