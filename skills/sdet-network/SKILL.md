---
name: sdet-network
description: 'Use this skill when intercepting HTTP/HTTPS traffic, stubbing backend API responses, simulating network errors, replaying HAR files, or making direct API requests to fast-seed data and isolate frontend tests, even if not explicitly mentioned.'
user-invocable: true
license: MIT
metadata:
  capability: 'network'
  frameworks: 'cypress,selenium,vibium,playwright'
---

# Network Interception, Mocking & API Verification Architecture

## 1. Overview

Controlling HTTP/HTTPS traffic via route interception, response stubbing, latency injection, and headless API requests isolates frontend tests and enables deterministic failure mode simulation.

## 2. Core Invariants & Universal Rules

1. **Shift-Left State Seeding**: Seed test prerequisites and user data via headless HTTP requests (`request.post()`, `cy.request()`) rather than clicking through multi-page UI forms, because API seeding executes in milliseconds and eliminates frontend UI flakiness during test setup.
2. **Register Interceptors Before Navigation**: Define network stubs and routes before calling `page.goto()` or triggering actions, because registering routes after navigation starts results in unintercepted in-flight requests.
3. **Explicit Response Synchronization**: Await specific network response promises (`waitForResponse()`, `cy.wait('@alias')`) when user actions trigger background requests, because guessing DOM settlement timing leads to race conditions.
4. **Scoped Mock Cleanup**: Scope mock routes per test or explicitly unroute them in teardown hooks, because leaked interceptors silently mutate the network behavior of subsequent tests.
5. **Contract & Status Verification**: Validate API response schemas and status codes directly when simulating service failure modes (e.g. 500 server errors, 429 rate limits) to verify frontend error boundary handling.

### Gotchas & Critical Traps

- **Cypress Single-Use Wait vs Persistent Intercept**: In Cypress, `cy.intercept()` stubs apply to all matching requests by default, but waiting on an alias (`cy.wait('@alias')`) only consumes the first occurrence.
- **Service Worker Interception Bypass**: Browser Service Workers can intercept fetch requests before standard devtools network routing catches them; bypass service workers when comprehensive API stubbing is required.
- **Missing CORS Headers on Fulfilled Routes**: When stubbing cross-origin responses with `route.fulfill()`, ensure required CORS headers (`access-control-allow-origin: '*'`) are included, otherwise the browser will block the response.

## 3. Step-by-Step Workflow

1. **Fast-Seed State via API**: Authenticate and populate required test data using headless HTTP requests rather than UI forms.
2. **Register Interceptors Before Navigation**: Attach `page.route()`, `cy.intercept()`, or BiDi network handlers prior to initiating `goto()`.
3. **Synchronize on Network Events**: Explicitly await response completion (`waitForResponse()`, `cy.wait('@alias')`) rather than guessing DOM settling times.
4. **Clean Up Interceptor Scope**: Unroute stubs in test teardown hooks and verify via `verify_test_artifact`.

## 4. When to Use

- **When to Use**:
  - Intercepting, stubbing, or modifying HTTP/HTTPS requests and responses.
  - Testing edge cases: network failures, HTTP 500 errors, rate limits, slow network delays.
  - Fast-seeding test data and authenticating via headless API calls.
  - Recording and replaying network traffic using HAR archives.
  - Validating payload schemas and API response contracts.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Storing and restoring browser cookies / session storage snapshots -> Use [sdet-storage-state](../sdet-storage-state/SKILL.md).
  - Verifying UI DOM states and visibility -> Use [sdet-assertions](../sdet-assertions/SKILL.md).
  - Capturing performance traces and console errors -> Use [sdet-observability](../sdet-observability/SKILL.md).

## 5. Universal Framework Paradigm Mapping

| Automation Framework | Interception & Mocking API                                                 | Request Synchronization                                         | Direct API Testing Engine                                 |
| :------------------- | :------------------------------------------------------------------------- | :-------------------------------------------------------------- | :-------------------------------------------------------- |
| **Playwright**       | Full-duplex `page.route()`, `route.fulfill()`                              | `page.waitForResponse()`, `page.waitForRequest()`               | `playwright.request.newContext()` (`APIRequestContext`)   |
| **Cypress**          | `cy.intercept('METHOD', '**/path', ...)`                                   | `cy.wait('@alias')` (implicit route matching)                   | `cy.request()`                                            |
| **Selenium 4**       | W3C BiDi `Network.addIntercept()` / `driver.network.add_request_handler()` | BiDi `onBeforeRequestSent` / `responseCompleted` event handlers | HTTP client libraries (HttpClient, requests, RestAssured) |
| **Vibium**           | BiDi network routing and mock response rules                               | BiDi response event subscriptions                               | Integrated BiDi network driver                            |

## 6. Dynamic MCP Knowledge & Tool Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `read_sdet_docs`:

- **Playwright Network**: When stubbing routes or mocking responses in Playwright, invoke `read_sdet_docs({ framework: "playwright", domain: "network", language: "typescript" | "javascript" | "python" | "java" | "csharp" })`.
- **Cypress Network & Fixtures**: When intercepting requests or loading fixture stubs in Cypress, invoke `read_sdet_docs({ framework: "cypress", domain: "network" | "stubs" | "fixtures", language: "typescript" | "javascript" })`.
- **Selenium BiDi Network**: When managing network interception via Selenium 4 BiDi, invoke `read_sdet_docs({ framework: "selenium", domain: "bidi", language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby" })`.
- **Vibium BiDi Network**: When routing requests or stubbing responses in Vibium, invoke `read_sdet_docs({ framework: "vibium", domain: "bidi", language: "typescript" | "javascript" | "python" | "java" })`.

Universal quality invariants and execution rules are accessible via `sdet://guidelines` and `sdet://invariants`.

## 7. Verification Checklist

- [ ] Network routes registered before navigation calls.
- [ ] Explicit promise/alias synchronization on network requests.
- [ ] Network mocks cleanly scoped and torn down per test.
- [ ] Validated via `verify_test_artifact({ code, framework, language })` with 100/100 score.
