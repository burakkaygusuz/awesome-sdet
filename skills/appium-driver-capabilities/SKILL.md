---
name: appium-driver-capabilities
description: 'Master Appium 3.6.0+ modular driver management, W3C capabilities (appium:options), UiAutomator2, XCUITest, and cross-platform session setup across languages.'
user-invocable: true
license: MIT
compatibility: Appium 3.x+
metadata:
  framework: appium
  keywords:
    - appium
    - uiautomator2
    - xcuitest
    - w3c-capabilities
    - driver-lifecycle
    - mobile-session
---

# Appium Driver Architecture & W3C Capabilities

## 1. What Is It?

Appium 3.6.0+ is a modular, cross-platform mobile test automation framework decoupled into independent drivers (UiAutomator2, XCUITest, Espresso, Flutter) and plugins, communicating strictly over standard W3C WebDriver protocols.

## 2. Core Capabilities & Responsibilities

- **Modular Driver Ecosystem**: Drivers are installed and managed independently via the Appium CLI (`appium driver install uiautomator2`, `appium driver install xcuitest`).
- **W3C Capabilities Compliance**: Non-standard capabilities MUST be prefixed with `appium:` (e.g. `appium:automationName`, `appium:appPackage`, `appium:bundleId`, `appium:noReset`).
- **Polyglot Client SDKs**: First-class support for WebdriverIO (TypeScript/JavaScript), Appium Python Client, Appium Java Client (`io.appium:java-client`), and Appium .NET Client.
- **Appium 3.6.0 Server Flags**: Tolerates unknown server arguments (`--allow-unknown-args`) and enforces driver-scoped insecure feature flags (`--allow-insecure=uiautomator2:adb_shell`).

## 3. Why Use It?

Enables unified, vendor-agnostic test automation across iOS and Android native apps, hybrid apps, and mobile browsers while preserving native platform-specific capabilities through modular drivers.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                              | Anti-Pattern                                                                              |
| :--------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------- |
| **Use `appium:` prefix**: Enforce W3C compliance on custom capabilities.                                   | **Unprefixed capabilities**: Using legacy Appium 1.x capabilities without prefix.         |
| **Leverage Driver Options Classes**: Use `UiAutomator2Options` and `XCUITestOptions`.                      | **Untyped Generic HashMaps**: Passing raw untyped dictionaries prone to typos.            |
| **Isolate Sessions with `noReset` / `fullReset`**: Configure reset strategy based on test isolation needs. | **Persistent Dirty State**: Sharing dirty app state between independent regression tests. |
| **Scoped Insecure Features**: Use driver scopes (`--allow-insecure=uiautomator2:adb_shell`).               | **Unscoped Global Insecure Flags**: Using obsolete unscoped insecure flags in Appium 3.x. |

## 5. Server Config File (`appium.yml` — Official Format)

> Appium 3.x reads config from JSON, YAML, JS, or CJS files. **YAML is the officially documented format** in all Appium 3.x guides ([appium.io/docs/en/3.1/guides/config](https://appium.io/docs/en/3.1/guides/config)).
> Note: TOML is **not** supported by the Appium server itself — it is only used for Selenium Grid node relay config (see §6).

```yaml
# appium.yml — place in project root, or pass via --config flag
server:
  port: 4723
  use-drivers:
    - uiautomator2
    - xcuitest
  log-level: info
  allow-cors: false
  relaxed-security: false
  default-capabilities:
    appium:newCommandTimeout: 300
```

```bash
# Install drivers, then start server with config
appium driver install uiautomator2
appium driver install xcuitest
appium --config appium.yml
```

## 6. Selenium Grid Node Relay (`node.toml` — TOML Only Here)

> When integrating Appium with Selenium Grid 4+, the **Grid node** uses TOML format. Appium itself remains YAML-configured.

```toml
# node.toml — Selenium Grid node that relays to Appium
[server]
port = 5555

[node]
detect-drivers = false

[events]
publish = "tcp://HUB_IP:4442"
subscribe = "tcp://HUB_IP:4443"

[relay]
url = "http://localhost:4723"
status-endpoint = "/status"
configs = [
  "1", "{\"platformName\": \"Android\", \"appium:automationName\": \"UiAutomator2\"}"
]
```

```bash
# Start the Grid hub, then start the node
java -jar selenium.jar hub
java -jar selenium.jar node --config node.toml
```

## 7. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_appium_capabilities_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java` | `csharp`)
- **Resource URI**: `appium://capabilities/{language}`
