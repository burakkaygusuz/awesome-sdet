---
name: sdet-storage-state
description: 'Use this skill when managing authentication sessions, caching login cookies and local storage snapshots, persisting credentials, or isolating multi-role test contexts to eliminate repetitive UI logins, even if not explicitly mentioned.'
user-invocable: true
license: MIT
metadata:
  capability: 'storage-state'
  frameworks: 'cypress,selenium,vibium,playwright'
---

# Authentication Snapshot Reuse, Session State & Context Isolation

## 1. Overview

Persisting authenticated state (cookies, local storage, session storage) allows new test contexts to instantiate pre-authenticated sessions, eliminating repetitive UI logins while guaranteeing complete test isolation.

## 2. Core Invariants & Universal Rules

1. **Shift-Left Authentication Snapshots**: Authenticate once per user role during global setup or via API, and serialize the resulting cookies and storage state to disk, because repeating manual UI login forms across hundreds of test specs wastes significant execution time and triggers rate limits.
2. **Strict Session & Context Isolation**: Instantiate every test spec in a clean, isolated browser context pre-seeded with the required storage state, because shared browser contexts allow mutable session cookies to leak between concurrent tests.
3. **Multi-Role Persona Snapshots**: Maintain separate, pre-generated state files for each distinct user role (`adminStorageState.json`, `userStorageState.json`), enabling instant role-based testing without inter-test login/logout sequences.
4. **Session Validation & Token Refresh**: Validate cached session state before test execution (e.g. `cy.session({ validate })`) to automatically re-authenticate when backend tokens expire.
5. **No Shared Cross-Test Mutations**: Treat storage snapshots as immutable baselines and never mutate shared state files during test runs.

### Gotchas & Critical Traps

- **IndexedDB & Storage State**: Standard browser `storageState` exports capture cookies and `localStorage`/`sessionStorage`, but may not serialize IndexedDB; apps using IndexedDB for auth tokens require custom injection scripts.
- **Domain-Scoped Cookies**: Injected cookies must match the exact protocol, domain, and path of the AUT, or the browser will silently ignore them during navigation.
- **SameSite Cookie Restrictions**: Restoring storage snapshots across different subdomains can fail if authentication cookies are configured with `SameSite=Strict`.

## 3. Step-by-Step Workflow

1. **Authenticate in Global Setup or via API**: Perform login once per persona and serialize storage state (`storageState.json`, `cy.session()`).
2. **Inject Pre-Authenticated Session**: Instantiate isolated browser contexts pre-seeded with target role credentials.
3. **Validate Session Freshness**: Attach validation callbacks to refresh expired tokens without manual UI login cascades.
4. **Enforce Storage Immutability**: Treat snapshots as read-only baselines and verify via `verify_test_artifact`.

## 4. When to Use

- **When to Use**:
  - Configuring global setup authentication flows for CI/CD test runs.
  - Setting up role-based access control (RBAC) tests (e.g., Admin vs. Regular User vs. Guest).
  - Persisting or injecting authentication tokens, session cookies, and local storage values.
  - Ensuring multi-worker parallel test isolation across distributed test runners.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Testing the login UI flow itself (invalid passwords, MFA form validation) -> Use [sdet-actions](../sdet-actions/SKILL.md) and [sdet-assertions](../sdet-assertions/SKILL.md).
  - Intercepting HTTP requests or stubbing API responses -> Use [sdet-network](../sdet-network/SKILL.md).
  - Managing mobile device app sessions and capabilities -> Use [sdet-mobile](../sdet-mobile/SKILL.md).

## 5. Universal Framework Paradigm Mapping

| Automation Framework | Session Caching Strategy                         | Multi-Role Isolation                       | Storage Injection API                                   |
| :------------------- | :----------------------------------------------- | :----------------------------------------- | :------------------------------------------------------ |
| **Playwright**       | `storageState` JSON snapshot files               | Worker fixtures with custom `storageState` | `browser.newContext({ storageState: 'auth.json' })`     |
| **Cypress**          | `cy.session(sessionId, setupFn, validateFn)`     | Keyed session IDs per persona              | Automatic cached session restoration                    |
| **Selenium 4**       | Programmatic cookie & localStorage serialization | Separate `WebDriver` session instances     | `driver.manage().addCookie()` & JS localStorage scripts |
| **Vibium**           | Browser context state snapshots                  | Isolated state pools                       | Native state import/export APIs                         |

## 6. Dynamic MCP Knowledge & Tool Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `read_sdet_docs`:

- **Playwright Storage**: When managing storage state snapshots and cookies in Playwright, invoke `read_sdet_docs({ framework: "playwright", domain: "storage", language: "typescript" | "javascript" | "python" | "java" | "csharp" })`.
- **Cypress Session**: When caching sessions and cookies in Cypress, invoke `read_sdet_docs({ framework: "cypress", domain: "session", language: "typescript" | "javascript" })`.
- **Selenium BiDi & Session State**: When managing cookies or BiDi network session state in Selenium 4, invoke `read_sdet_docs({ framework: "selenium", domain: "bidi", language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby" })`.
- **Vibium State**: When saving or restoring browser context state snapshots in Vibium, invoke `read_sdet_docs({ framework: "vibium", domain: "state", language: "typescript" | "javascript" | "python" | "java" })`.

Universal quality invariants and execution rules are accessible via `sdet://guidelines` and `sdet://invariants`.

## 7. Verification Checklist

- [ ] Repetitive UI logins replaced with storage snapshots or API auth.
- [ ] Multi-role tests isolated with separate state files.
- [ ] Shared state files kept immutable during test execution.
- [ ] Validated via `verify_test_artifact({ code, framework, language })` with 100/100 score.
