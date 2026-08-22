---
name: sdet-mobile
description: 'Use this skill when authoring mobile test automation for iOS or Android applications. Trigger when configuring driver capabilities, switching between native and webview contexts, automating touch gestures, or controlling device app lifecycles, even if not explicitly mentioned.'
user-invocable: true
license: MIT
metadata:
  capability: 'mobile'
  frameworks: 'appium'
---

# Mobile Automation Architecture, Context Switching & Device Lifecycle

## 1. Overview

Mobile automation standardizes iOS (XCUITest) and Android (UiAutomator2) testing via Appium 2.x W3C options, polled WebView context switching, and W3C pointer gestures.

## 2. Core Invariants & Universal Rules

1. **W3C Standard Capabilities**: Always nest driver capabilities under `appium:options` or use language-specific option builders (`UiAutomator2Options`, `XCUITestOptions`), because legacy un-namespaced capabilities are deprecated and rejected by Appium 2.x/3.x servers.
2. **Deterministic Hybrid Context Polling**: Poll `driver.getContexts()` until the target `WEBVIEW` handle is initialized before switching contexts, because webviews take variable time to mount and immediate switching causes race condition failures.
3. **W3C PointerInput Gestures**: Compose touch actions using W3C `PointerInput` / `ActionChains` sequences instead of deprecated `TouchAction` APIs, because legacy touch APIs were removed in modern Appium clients.
4. **Idempotent App Lifecycle Reset**: Use driver lifecycle methods (`terminateApp`, `activateApp`, `installApp`) and clean teardown hooks to ensure each test starts from a clean application state.
5. **OS Permission & Alert Handling**: Handle system dialogs via capabilities (`appium:autoGrantPermissions`) or mobile extension commands (`mobile: acceptAlert`) rather than manual UI clicks, because system dialogs vary across OS versions.

### Gotchas & Critical Traps

- **iOS sendKeys Text Append**: On iOS XCUITest, `element.sendKeys()` appends text to existing field content unless `element.clear()` is called first.
- **Context Handle Naming on Android**: Android WebView context names often include package or process IDs (e.g. `WEBVIEW_org.chromium.webview_shell`), requiring regex or prefix matching rather than static string equality.
- **Appium 2.0 Base Path**: Appium 2.x servers default to `/` rather than `/wd/hub`; connecting to `/wd/hub` causes 404 errors unless explicitly configured with `--base-path=/wd/hub`.

## 3. Step-by-Step Workflow

1. **Configure W3C Capabilities**: Initialize driver with dedicated options class (`UiAutomator2Options` / `XCUITestOptions`).
2. **Handle Context Transitions**: When testing hybrid apps, poll `getContexts()` before switching and guarantee return to `NATIVE_APP` in `finally`.
3. **Dispatch W3C Pointer Gestures**: Implement swipes and scrolls strictly via `PointerInput` actions.
4. **Enforce Clean Teardown**: Call `driver.quit()` or `driver.terminateApp()` and verify via `verify_test_artifact`.

## 4. When to Use

- **When to Use**:
  - Automating native mobile applications on iOS (XCUITest) or Android (UiAutomator2).
  - Automating hybrid mobile apps containing embedded WebViews or Safari/Chrome view controllers.
  - Controlling device settings: orientation, network throttling, biometric authentication bypass, app backgrounding.
  - Configuring Appium server capabilities and cross-device test execution grids.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Querying mobile element selectors -> Use [sdet-locators](../sdet-locators/SKILL.md).
  - Web-only browser testing (Chrome, Safari, Firefox) -> Use [sdet-actions](../sdet-actions/SKILL.md) / [sdet-authoring](../sdet-authoring/SKILL.md).
  - Intercepting HTTP network traffic on web applications -> Use [sdet-network](../sdet-network/SKILL.md).

## 5. Universal Framework Paradigm Mapping

| Mobile Domain / Feature | Appium 2.x W3C Standard                                                | Multi-Platform Strategy                                 |
| :---------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------ |
| **Driver Capabilities** | `UiAutomator2Options` (Android), `XCUITestOptions` (iOS)               | Vendor-prefixed (`appium:automationName`, `appium:app`) |
| **Context Switching**   | `driver.getContexts()`, switch to `WEBVIEW_<id>`                       | Safe `try...finally` return to `NATIVE_APP`             |
| **Touch & Gestures**    | W3C `PointerInput` / `ActionChains` (tap, scroll, swipe, drag)         | Standard normalized pixel coordinates                   |
| **Device Lifecycle**    | `driver.installApp()`, `driver.terminateApp()`, `driver.activateApp()` | Idempotent teardown hooks                               |

## 6. Dynamic MCP Knowledge & Tool Schemas (Level 3 On-Demand Code Delivery)

`read_sdet_docs({ framework, domain, query })` — `language` optional (framework default). Domains for this capability:

- Appium `capabilities` · `context` · `device` · `gestures`

Universal invariants: `sdet://guidelines` · `sdet://invariants`.

## 7. Verification Checklist

- [ ] Zero deprecated `TouchAction` or non-W3C capabilities used.
- [ ] Context switching wrapped in `try...finally` returning to `NATIVE_APP`.
- [ ] Device sessions cleanly terminated in teardown hooks.
- [ ] Validated via `verify_test_artifact({ code, framework: "appium", language })` with 100/100 score.
