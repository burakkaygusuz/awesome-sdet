---
name: listeners
description: Event interception, command decorators (EventFiringDecorator), automated logging, and driver lifecycle hooks. Trigger on EventFiringDecorator or WebDriverListener.
user-invocable: true
license: MIT
compatibility: Selenium 4.0+
metadata:
  framework: selenium
  keywords:
    - event-firing-decorator
    - webdriver-listener
    - event-interception
    - command-interception
    - driver-logging
---

# Selenium Event Listeners & Decorators Architecture

## 1. What Is It?

Selenium Event Listeners and Decorators provide an event interception framework to execute custom hooks before and after raw WebDriver commands.

## 2. Core Capabilities & Responsibilities

- **Command Interception**: Listens to events before and after execution (e.g. `click`, `navigate`, `findElement`).
- **Automated Logging & Diagnostics**: Logs test execution steps automatically and captures screenshots on failure events.

## 3. Why Use It?

Eliminates repetitive manual logging or try-catch blocks across test scripts, establishing a clean, centralized diagnostic logging layer.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                                     | Anti-Pattern                                                                                                    |
| :---------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| **Decorate Early**: Wrap the base WebDriver instance with `EventFiringDecorator` immediately after instantiation. | **Deprecated Decorators**: Utilizing the deprecated `EventFiringWebDriver` class in Selenium 4.                 |
| **Non-blocking Callbacks**: Keep listener callbacks lightweight.                                                  | **Heavy Listener Callbacks**: Performing blocking network/disk I/O inside callbacks, delaying command dispatch. |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_se_listeners_docs`
- **Parameters**: `language` (`java` | `python` | `typescript` | `javascript` | `csharp` | `ruby`)
