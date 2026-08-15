---
name: sdet-network
description: 'Use this skill when intercepting HTTP/HTTPS traffic, stubbing backend API responses, mocking network errors, replaying HAR files, or making direct API requests. Trigger when shifting API setup left or isolating frontend tests.'
user-invocable: true
license: MIT
metadata:
  capability: 'network'
  frameworks: 'cypress,selenium,vibium,playwright'
---

# Network Interception, Mocking & API Verification Architecture

## 1. Overview

Reliable test automation requires precise control over external HTTP/HTTPS traffic. Modern test runners provide full-duplex network routing, request interception, response stubbing, latency injection, and headless API execution.

By controlling network responses, SDET suites simulate hard-to-reproduce edge cases (e.g. 500 internal server errors, rate limiting, partial outages, timeout race conditions) deterministically, while also replacing slow UI-based setup flows with high-speed API requests.

## 2. Core Invariants & Universal Rules

1. **Shift-Left State Preparation**: Never execute repetitive multi-step UI flows solely to seed data. Use direct headless API requests (`request.post()`, `cy.request()`) or mock fixtures to seed test state instantaneously.
2. **Deterministic Route Registration Before Navigation**: Interception routes and stubs must be registered _before_ triggering actions or navigating to the target URL to prevent unmocked race conditions.
3. **Explicit Response Waiting**: When actions trigger network activity, synchronize explicitly on the response promise or route alias (`waitForResponse()`, `cy.wait('@alias')`) rather than guessing DOM transition timings.
4. **Isolated Stub Scope**: Clean up or unroute network mocks after test completion to prevent route contamination across test suites.
5. **HAR Recording & Replay for Determinism**: Use HAR archives for deterministic replay in third-party API dependencies or offline CI environments.

### Best Practices vs. Anti-Patterns

| Category            | Best Practice                                                     | Anti-Pattern                                                            |
| :------------------ | :---------------------------------------------------------------- | :---------------------------------------------------------------------- |
| **Data Seeding**    | Seed database or state via direct API requests before loading UI. | Clicking through 10 registration forms in UI before every test.         |
| **Synchronization** | Await explicit network response promises (`waitForResponse`).     | Hardcoding arbitrary sleeps hoping background AJAX finishes.            |
| **Route Timing**    | Define network routes and mock interceptors before `page.goto()`. | Registering routes after page navigation has already begun.             |
| **Failure Testing** | Mock 500 / 429 status codes to test UI error boundary resilience. | Manually shutting down staging backend servers to test UI error states. |
| **Mock Isolation**  | Scope mocks per test or use context-level routing.                | Leaking global mock interceptors across unrelated test cases.           |

## 3. When to Use

- **When to Use**:
  - Intercepting, stubbing, or modifying HTTP/HTTPS requests and responses.
  - Testing edge cases: network failures, HTTP 500 errors, rate limits, slow network delays.
  - Fast-seeding test data and authenticating via headless API calls.
  - Recording and replaying network traffic using HAR archives.
  - Validating payload schemas and API response contracts.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Storing and restoring browser cookies / session storage snapshots -> Use [sdet-storage-state](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-storage-state/SKILL.md).
  - Verifying UI DOM states and visibility -> Use [sdet-assertions](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-assertions/SKILL.md).
  - Capturing performance traces and console errors -> Use [sdet-observability](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-observability/SKILL.md).

## 4. Universal Framework Paradigm Mapping

| Automation Framework | Interception & Mocking API                              | Request Synchronization                           | Direct API Testing Engine                                 |
| :------------------- | :------------------------------------------------------ | :------------------------------------------------ | :-------------------------------------------------------- |
| **Playwright**       | Full-duplex `page.route()`, `route.fulfill()`           | `page.waitForResponse()`, `page.waitForRequest()` | `playwright.request.newContext()` (`APIRequestContext`)   |
| **Cypress**          | `cy.intercept('METHOD', '**/path', ...)`                | `cy.wait('@alias')` (implicit route matching)     | `cy.request()`                                            |
| **Selenium 4**       | CDP `Network.setRequestInterception` / W3C BiDi Network | BiDi `network.responseCompleted` event streams    | HTTP client libraries (HttpClient, requests, RestAssured) |
| **Vibium**           | BiDi network routing and mock response rules            | BiDi response event subscriptions                 | Integrated BiDi network driver                            |

## 5. Dynamic MCP Tool & Resource Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `sdet-mcp` tools or read dynamic resources:

- **Playwright**: `read_pw_network_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URI: `playwright://network/{language}`
- **Cypress**: `read_cy_network_docs`, `read_cy_stubs_docs`, `read_cy_fixtures_docs` (Parameters: `language: "typescript" | "javascript"`) -> URIs: `cypress://network/{language}`, `cypress://stubs/{language}`, `cypress://fixtures/{language}`
- **Selenium**: `read_se_bidi_docs` (Parameters: `language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby"`) -> URI: `selenium://bidi/{language}`
- **Vibium**: `read_vibium_bidi_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java"`) -> URI: `vibium://bidi/{language}`
