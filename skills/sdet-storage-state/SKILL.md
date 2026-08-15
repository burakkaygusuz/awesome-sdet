---
name: sdet-storage-state
description: 'Use this skill when managing authentication sessions, caching login cookies and storage state, persisting user credentials, or isolating multi-role test contexts. Trigger when eliminating repetitive UI logins or setting up auth fixtures.'
user-invocable: true
license: MIT
metadata:
  capability: 'storage-state'
  frameworks: 'cypress,selenium,vibium,playwright'
---

# Authentication Snapshot Reuse, Session State & Context Isolation

## 1. Overview

In enterprise end-to-end test suites, logging in through the user interface for every single test case introduces immense execution overhead, rate-limiting risks, and test fragility.

**Storage State & Session Persistence** captures authenticated state (HTTP cookies, `localStorage`, `sessionStorage`, and IndexedDB) once and snapshots it to disk or memory. Downstream test cases instantiate clean, isolated browser contexts pre-seeded with this storage snapshot, eliminating 90%+ of redundant authentication steps while maintaining complete test isolation and idempotency.

## 2. Core Invariants & Universal Rules

1. **Shift-Left Authentication**: Log in once per test role during global setup or through direct API calls, and serialize the resulting state snapshot. Never repeat UI login screens in non-login test specs.
2. **Strict Test Context Isolation**: Every test scenario must execute within its own pristine browser context or isolated session sandbox. State mutated during test execution must never leak into subsequent tests.
3. **Multi-Role Test Matrix**: Maintain distinct state snapshots for every discrete user persona (e.g. `adminStorageState.json`, `editorStorageState.json`, `unauthenticatedState`).
4. **Session Validation & Cache Invalidation**: Cached session states must include validation mechanisms (`cy.session({ validate })`, token expiry checks) that automatically re-authenticate when tokens expire.
5. **No Cross-Test Shared Mutable State**: Tests must remain completely independent, parallelizable, and idempotent.

### Best Practices vs. Anti-Patterns

| Category               | Best Practice                                                         | Anti-Pattern                                                                 |
| :--------------------- | :-------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| **Authentication**     | Snapshot authenticated storage state (`storageState.json`) and reuse. | Manually filling login credentials in the UI before every test.              |
| **Session Isolation**  | Create fresh, isolated browser contexts for each test spec.           | Running 100 tests in a single persistent browser window with shared cookies. |
| **Multi-Role Testing** | Parameterize test fixtures with dedicated persona snapshots.          | Manually logging in and logging out between roles inside a single test.      |
| **State Reset**        | Ensure teardown resets mutated data or relies on ephemeral sandboxes. | Leaving persistent database mutations that cause subsequent tests to fail.   |
| **Fast-Seeding**       | Populate `localStorage` and auth cookies directly via API responses.  | Navigating through 5 onboarding steps before testing feature settings.       |

## 3. When to Use

- **When to Use**:
  - Configuring global setup authentication flows for CI/CD test runs.
  - Setting up role-based access control (RBAC) tests (e.g., Admin vs. Regular User vs. Guest).
  - Persisting or injecting authentication tokens, session cookies, and local storage values.
  - Ensuring multi-worker parallel test isolation across distributed test runners.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Testing the login UI flow itself (invalid passwords, MFA form validation) -> Use [sdet-actions](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-actions/SKILL.md) and [sdet-assertions](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-assertions/SKILL.md).
  - Intercepting HTTP requests or stubbing API responses -> Use [sdet-network](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-network/SKILL.md).
  - Managing mobile device app sessions and capabilities -> Use [sdet-mobile](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-mobile/SKILL.md).

## 4. Universal Framework Paradigm Mapping

| Automation Framework | Session Caching Strategy                         | Multi-Role Isolation                       | Storage Injection API                                   |
| :------------------- | :----------------------------------------------- | :----------------------------------------- | :------------------------------------------------------ |
| **Playwright**       | `storageState` JSON snapshot files               | Worker fixtures with custom `storageState` | `browser.newContext({ storageState: 'auth.json' })`     |
| **Cypress**          | `cy.session(sessionId, setupFn, validateFn)`     | Keyed session IDs per persona              | Automatic cached session restoration                    |
| **Selenium 4**       | Programmatic cookie & localStorage serialization | Separate `WebDriver` session instances     | `driver.manage().addCookie()` & JS localStorage scripts |
| **Vibium**           | Browser context state snapshots                  | Isolated state pools                       | Native state import/export APIs                         |

## 5. Dynamic MCP Tool & Resource Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `sdet-mcp` tools or read dynamic resources:

- **Playwright**: `read_pw_storage_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URI: `playwright://storage/{language}`
- **Cypress**: `read_cy_session_docs` (Parameters: `language: "typescript" | "javascript"`) -> URI: `cypress://session/{language}`
- **Selenium**: `read_se_observability_docs` (Parameters: `language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby"`) -> URI: `selenium://observability/{language}`
- **Vibium**: `read_vibium_state_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java"`) -> URI: `vibium://state/{language}`
