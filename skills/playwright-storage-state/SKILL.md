---
name: playwright-storage-state
description: 'Manage BrowserContext isolation, authentication snapshot reuse with storageState, and WebAuthn credentials persistence in Playwright.'
user-invocable: true
license: MIT
compatibility: Playwright 1.x+
metadata:
  framework: playwright
  keywords:
    - playwright
    - storage-state
    - authentication
    - session
    - browser-context
    - isolation
    - cookies
    - local-storage
    - webauthn
    - fixtures
---

# Storage State & Context Isolation

## 1. What Is It?

Playwright enforces strict **BrowserContext Isolation**. Each `BrowserContext` operates as an independent, ephemeral browser profile with its own cookies, local storage, indexedDB, and cache. Spawning a new context takes only milliseconds and requires zero disk footprint.

The `storageState` API allows tests to capture authenticated cookies, security tokens, and local storage keys into a portable JSON snapshot file (`storageState.json`) and re-inject that state into newly spawned `BrowserContext` instances.

## 2. Core Capabilities & Responsibilities

- **Authentication State Snapshotting (`context.storageState({ path })`)**: Exports current authentication tokens, session cookies, and local storage items into a structured JSON file.
- **Context Re-Injection (`browser.newContext({ storageState })`)**: Initializes a fresh, isolated browser context with pre-authenticated session state, bypassing login UI steps entirely.
- **Global Setup Projects (`setup` project dependency)**: Configures a dedicated authentication setup step in `playwright.config.ts` that runs once prior to test execution, storing credentials under `.auth/user.json`.
- **Worker-Scoped Auth Fixtures**: Extends the `test` runner with custom worker-scoped fixtures to maintain isolated authentication contexts per parallel test worker (`parallelIndex`).
- **WebAuthn & Passkey Persistence**: Includes virtual WebAuthn credentials and passkeys via the `credentials: true` option in `storageState`.
- **Multi-Role & Multi-User Testing**: Easily orchestrates multi-actor scenarios (e.g. Buyer vs Seller, Admin vs User) by instantiating multiple contexts with distinct storage states in a single test.

## 3. Why Use It?

Automating repetitive UI login forms in every test introduces massive execution overhead (often 5-10 seconds per test) and creates widespread test flakiness when login endpoints experience network delays. `storageState` cuts suite runtimes by 70-90% while guaranteeing 100% test isolation.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                          | Anti-Pattern                                                                                           |
| :----------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Authenticate Once in Global Setup**: Save state to `.auth/user.json` via setup project dependencies. | **Repetitive UI Logins**: Automating username, password, and 2FA input forms in every `test()` block.  |
| **Isolate by Context, Not by Browser**: Create lightweight `BrowserContext` instances for each test.   | **Shared Mutable Contexts**: Reusing a single browser context across multiple tests causing pollution. |
| **Worker-Scoped State for Shared Environments**: Scope auth state by `test.info().parallelIndex`.      | **Shared Test Accounts in Parallel**: Having parallel workers log in with the exact same user account. |
| **Store Tokens in `.auth/` (Gitignored)**: Keep generated auth files in `.auth/` directory.            | **Hardcoding Tokens in Git**: Committing production credentials or live JWT tokens to source control.  |
| **Multi-Actor Testing via Separate Contexts**: Instantiate `adminContext` and `userContext` cleanly.   | **Logging Out and In Sequentially**: Logging out user A in the UI to log in user B in the same window. |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_pw_storage_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java` | `csharp`)
- **Resource URI**: `playwright://storage/{language}`
