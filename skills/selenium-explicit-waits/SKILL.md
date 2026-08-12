---
name: selenium-explicit-waits
description: 'Synchronize test execution using condition-based explicit waiting strategies in Selenium. Use when handling dynamic asynchronous DOM updates with WebDriverWait, FluentWait, or ExpectedConditions without hardcoded sleeps.'
user-invocable: true
license: MIT
compatibility: Selenium 4.x+
metadata:
  framework: selenium
  keywords:
    - explicit-waits
    - webdriver-wait
    - expected-conditions
    - fluent-wait
    - synchronization
---

# Synchronization & Explicit Waits Architecture

## 1. What Is It?

The explicit wait synchronization architecture resolves timing mismatches between browser DOM rendering speeds and automation script execution timing in Selenium test suites.

## 2. Core Capabilities & Responsibilities

- **Condition-Based Waiting (`WebDriverWait`)**: Polls until target conditions evaluate to true (e.g. `elementToBeClickable`, `visibilityOfElementLocated`).
- **FluentWait**: Configures custom polling intervals and ignores non-fatal exceptions (`NoSuchElementException`) during evaluation.

## 3. Why Use It?

Eliminates test flakiness. Over 90% of intermittent test failures stem from improper waiting strategies. Hardcoded pauses (`Thread.sleep`) slow execution down unnecessarily, while implicit waits fail on complex dynamic states.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                                 | Anti-Pattern                                                                                  |
| :------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------- |
| **Zero Implicit Wait Policy**: Set global implicit wait to 0 seconds and rely strictly on Explicit Waits.     | **Mixing Wait Types**: Combining implicit and explicit waits, causing unpredictable timeouts. |
| **Condition-Specific Polling**: Wait for specific states (e.g., `elementToBeClickable`) prior to interaction. | **Hardcoded Delays**: Inserting fixed sleeps (`Thread.sleep`) throughout test scripts.        |

## 5. Dynamic Tool Schemas & Validation

Validate explicit wait expressions using the `sdet-mcp` tool:

- **Tool**: `execute_se_explicit_wait`
- **Parameters**: `condition`, `timeoutSeconds`
