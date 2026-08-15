---
name: sdet-mobile
description: 'Use this skill when authoring mobile test automation for iOS or Android. Trigger when configuring driver capabilities, switching between native and webview contexts, automating multi-touch gestures, or controlling device app lifecycles.'
user-invocable: true
license: MIT
metadata:
  capability: 'mobile'
  frameworks: 'appium'
---

# Mobile Automation Architecture, Context Switching & Device Lifecycle

## 1. Overview

Mobile application test automation requires specialized handling of mobile operating system environments (iOS XCUITest, Android UiAutomator2). Unlike browser automation, mobile SDET engineering deals with native accessibility trees, multi-touch gestures, device hardware controls (orientation, biometrics, notifications, permissions), hybrid WebView context switching, and application lifecycle states.

The **sdet-mobile** capability standardizes mobile testing architecture in Appium 2.x/3.x, enforcing W3C driver capabilities, Screen Object Model (SOM) abstractions, and robust hybrid context management.

## 2. Core Invariants & Universal Rules

1. **W3C Standard Capabilities (`appium:options`)**: All driver capabilities must be nested under the `appium:options` vendor prefix conforming to W3C WebDriver specifications (e.g. `appium:automationName`, `appium:deviceName`, `appium:app`).
2. **Deterministic Context Switching**: Hybrid application flows must explicitly poll available contexts (`driver.getContexts()`) before switching between `NATIVE_APP` and `WEBVIEW_<id>` to avoid context race conditions.
3. **Idempotent Device & App State Management**: Configure `appium:noReset` and `appium:fullReset` intentionally. Teardown hooks must ensure background processes, device alerts, and app instances are cleanly reset between test runs.
4. **W3C PointerInput Gestures**: All touch gestures (swipes, long presses, multi-touch pinches) must use W3C Actions `PointerInput` rather than deprecated `TouchAction` APIs.
5. **Hardware & Biometric State Mocking**: Use Appium mobile extension commands (`mobile: enrollBiometric`, `mobile: acceptAlert`) rather than manual UI navigations to bypass OS security prompts.

### Best Practices vs. Anti-Patterns

| Category                 | Best Practice                                                                 | Anti-Pattern                                                                |
| :----------------------- | :---------------------------------------------------------------------------- | :-------------------------------------------------------------------------- |
| **Capabilities**         | Use W3C prefixed options: `appium:automationName = 'XCUITest'`.               | Using un-namespaced legacy capabilities like `automationName`.              |
| **Context Switching**    | Poll `driver.getContexts()` until the target `WEBVIEW` is available.          | Immediately calling `switchContext('WEBVIEW')` before WebView initializes.  |
| **App Lifecycle**        | Use driver app lifecycle commands (`terminateApp`, `activateApp`).            | Relying on UI clicks to navigate back to device home screen.                |
| **Touch Gestures**       | Compose W3C `PointerInput` action sequences with clear pauses.                | Using deprecated `TouchAction` chains that fail in modern Appium.           |
| **Permissions / Alerts** | Set `appium:autoGrantPermissions = true` or handle via `mobile: acceptAlert`. | Writing brittle manual UI clicks to dismiss standard OS permission dialogs. |

## 3. When to Use

- **When to Use**:
  - Automating native mobile applications on iOS (XCUITest) or Android (UiAutomator2).
  - Automating hybrid mobile apps containing embedded WebViews or Safari/Chrome view controllers.
  - Controlling device settings: orientation, network throttling, biometric authentication bypass, app backgrounding.
  - Configuring Appium server capabilities and cross-device test execution grids.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Querying mobile element selectors -> Use [sdet-locators](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-locators/SKILL.md).
  - Web-only browser testing (Chrome, Safari, Firefox) -> Use [sdet-actions](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-actions/SKILL.md) / [sdet-authoring](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-authoring/SKILL.md).
  - Intercepting HTTP network traffic on web applications -> Use [sdet-network](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-network/SKILL.md).

## 4. Universal Framework Paradigm Mapping

| Mobile Domain / Feature | Appium 2.x W3C Standard                                                | Multi-Platform Strategy                                 |
| :---------------------- | :--------------------------------------------------------------------- | :------------------------------------------------------ |
| **Driver Capabilities** | `UiAutomator2Options` (Android), `XCUITestOptions` (iOS)               | Vendor-prefixed (`appium:automationName`, `appium:app`) |
| **Context Switching**   | `driver.getContextHandles()`, `driver.context('WEBVIEW_...')`          | Safe `try...finally` return to `NATIVE_APP`             |
| **Touch & Gestures**    | W3C `PointerInput` / `ActionChains` (tap, scroll, swipe, drag)         | Standard normalized pixel coordinates                   |
| **Device Lifecycle**    | `driver.installApp()`, `driver.terminateApp()`, `driver.activateApp()` | Idempotent teardown hooks                               |

## 5. Dynamic MCP Tool & Resource Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `sdet-mcp` tools or read dynamic resources:

- **Appium**: `read_appium_capabilities_docs`, `read_appium_context_docs`, `read_appium_device_docs`, `read_appium_gestures_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URIs: `appium://capabilities/{language}`, `appium://context/{language}`, `appium://device/{language}`, `appium://gestures/{language}`
