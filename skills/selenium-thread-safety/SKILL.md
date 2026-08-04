---
name: selenium-thread-safety
description: Concurrency patterns, thread safety rules, isolated driver lifecycle management, and parallel test execution strategies for Selenium test suites. Trigger on thread safety, parallel execution, driver factory, ThreadLocal, or concurrent test execution.
metadata:
  keywords: ['selenium', 'thread-safety', 'parallel-execution', 'concurrency', 'testing']
---

# Parallel Execution & Thread Safety Architecture

## 1. What Is It?

Thread safety architecture ensures WebDriver instances are strictly isolated per execution thread during concurrent, parallel test suite execution.

## 2. Core Capabilities & Responsibilities

- **Thread-Isolated Sessions**: Allocates an independent `WebDriver` instance to each thread.
- **Driver Factory (`DriverFactory`)**: Centralizes driver instantiation, configuration, and teardown logic.
- **Lifecycle Adapters**: Integrates with test framework lifecycles (JUnit 5, TestNG, PyTest).

## 3. Why Use It?

`WebDriver` objects are **not thread-safe**. Sharing a single driver instance across concurrent threads leads to race conditions, session state corruption, and flaky test crashes.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                       | Anti-Pattern                                                                                          |
| :-------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------- |
| **Strict Thread Isolation**: Scope driver references to individual execution threads.               | **Shared Static Drivers**: Reusing a static `driver` field across parallel threads without isolation. |
| **Deterministic Teardown**: Always invoke `driver.quit()` in `finally` or framework teardown hooks. | **Leaked Drivers**: Failing to quit drivers on test failure, leaking browser processes and memory.    |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_se_grid_docs`
- **Parameters**: `language` (`java` | `python` | `typescript` | `javascript` | `csharp` | `ruby`)
