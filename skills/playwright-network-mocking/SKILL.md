---
name: playwright-network-mocking
description: 'Intercept network traffic, stub API responses, simulate network failures, record HAR archives, and execute direct HTTP API tests with Playwright.'
user-invocable: true
license: MIT
compatibility: Playwright 1.x+
metadata:
  framework: playwright
  keywords:
    - playwright
    - network
    - routing
    - mock
    - stub
    - abort
    - fulfill
    - har
    - api-request-context
    - shift-left
---

# Network Interception & Routing

## 1. What Is It?

Playwright provides deep, full-duplex network interception capabilities through `page.route()` and `context.route()`. Once routing is enabled, matching HTTP/HTTPS network requests are intercepted before reaching the server, allowing tests to fulfill synthetic responses, modify headers, simulate server errors, or abort requests on demand.

In addition, Playwright provides `APIRequestContext` for executing headless, fast HTTP requests (`GET`, `POST`, `PUT`, `DELETE`) directly from test specifications without launching or navigating a browser page.

## 2. Core Capabilities & Responsibilities

- **Route Interception (`page.route()`, `context.route()`)**: Matches URLs using glob patterns (`*/**/api/v1/users`), regular expressions, or custom predicate functions.
- **Synthetic Response Fulfillment (`route.fulfill()`)**: Returns mock data immediately:
  - Custom status code (`status: 200`, `status: 404`, `status: 500`).
  - Custom JSON payload (`json: { id: 1, name: 'Alice' }`).
  - Custom headers and content types (`contentType: 'application/json'`).
- **Network Failure Simulation (`route.abort()`)**: Simulates network dropouts and errors (`aborted`, `failed`, `timedout`, `connectionrefused`).
- **Request Modification & Continuation (`route.continue()`, `route.fetch()`)**: Forwards requests to the real backend while allowing header overrides, query parameter injections, or response payload transformation.
- **HAR Recording & Playback**: Records live traffic to `.har` files via `page.routeFromHAR()` or context options for deterministic offline replay.
- **Shift-Left API Seeding (`request` fixture)**: Uses `APIRequestContext` to seed database state, create test entities, or generate authentication tokens prior to UI navigation.

## 3. Why Use It?

Relying on live external backend services, third-party payment gateways, or production APIs makes E2E tests slow, flaky, and expensive. Network routing isolates frontend verification, accelerates test execution by 10x, and enables deterministic testing of edge cases (e.g. 500 internal server errors, rate limits, network timeouts).

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                         | Anti-Pattern                                                                                                  |
| :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Register Routes Before Navigation**: Declare `await page.route()` prior to calling `page.goto()`.   | **Late Route Registration**: Registering routes after navigation, causing race conditions with initial fetch. |
| **Unblock Handlers**: Always call `route.fulfill()`, `route.continue()`, or `route.abort()`.          | **Hanging Routes**: Forgetting to resolve or continue routes, causing browser requests to stall forever.      |
| **Shift-Left with `request` Fixture**: Seed user data via `request.post()` instead of UI form clicks. | **Slow UI Seeding**: Automating 10 form screens solely to set up preliminary test state.                      |
| **Scope to Glob URL**: Use specific path globs (`*/**/api/users/*`) instead of broad `**/*`.          | **Over-Catching Routes**: Intercepting and stalling static assets, fonts, or scripts unintentionally.         |
| **Mock Dynamic Endpoints for Determinism**: Stub dynamic timestamps, UUIDs, and random data feeds.    | **Flaky Dynamic Assertions**: Asserting unpredictable live production data.                                   |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_pw_network_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java` | `csharp`)
- **Resource URI**: `playwright://network/{language}`
