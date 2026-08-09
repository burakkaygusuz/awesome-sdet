---
name: selenium-cookies-storage
description: 'HTTP cookie management, UI auth bypass via session injection, and HTML5 Web Storage state. Trigger on cookies, auth bypass, LocalStorage, or SessionStorage.'
user-invocable: true
license: MIT
compatibility: Selenium 4.x+
metadata:
  framework: selenium
  keywords:
    - cookie-management
    - auth-bypass
    - session-injection
    - local-storage
    - session-storage
---

# Cookie & Session Storage Architecture

## 1. What Is It?

HTTP Cookie and HTML5 Web Storage (LocalStorage / SessionStorage) management provides the architectural infrastructure for controlling browser session state, authentication tokens (JWT/Session ID), and application preferences.

## 2. Core Capabilities & Responsibilities

- **Authentication Bypass**: Injects pre-authenticated session cookies or JWT tokens to skip UI login steps.
- **Cookie Lifecycle Management**: Executes adding (`addCookie`), fetching (`getCookieNamed`), and clearing (`deleteAllCookies`) HTTP cookies.
- **Web Storage Manipulation**: Manages `window.localStorage` and `window.sessionStorage` via `JavascriptExecutor`.

## 3. Why Use It?

Executing manual login forms via UI elements in every test case slows down execution suites by up to 10x. Directly injecting session state into the browser maximizes execution speed and test stability.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                                    | Anti-Pattern                                                                                                  |
| :--------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------ |
| **Navigate to Domain First**: Load a lightweight page on the target domain before setting cookies or storage.    | **Cross-Domain Cookie Injection**: Attempting to add cookies prior to domain navigation, violating W3C rules. |
| **Use `JavascriptExecutor`**: Manage Web Storage via `JavascriptExecutor` scripts.                               | **Deprecated API Usage**: Attempting to use removed `html5.LocalStorage` interfaces in Selenium 4.            |
| **Set Explicit Cookie Flags**: Define `path="/"`, `isSecure(true)`, and domain attributes when building cookies. | **Incomplete Cookie Objects**: Building cookies without explicit scope matching target app policies.          |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_se_locator_docs`
- **Parameters**: `language` (`java` | `python` | `typescript` | `javascript` | `csharp` | `ruby`)
