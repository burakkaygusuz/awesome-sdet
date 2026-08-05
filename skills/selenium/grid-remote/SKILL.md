---
name: grid-remote
description: 'RemoteWebDriver, enterprise Selenium Grid 4 infrastructure, TOML node stereotypes, and cloud grid scaling. Trigger on RemoteWebDriver, Grid 4, or TOML stereotypes.'
user-invocable: true
license: MIT
compatibility: Selenium 4.0+
metadata:
  framework: selenium
  keywords:
    - remotewebdriver
    - selenium-grid-4
    - toml-stereotypes
    - cloud-grid
    - distributed-execution
---

# RemoteWebDriver & Enterprise Selenium Grid 4 Architecture

## 1. What Is It?

RemoteWebDriver and Selenium Grid 4 infrastructure provides distributed, parallel test execution capabilities across remote servers, containerized node pools, and cloud grid providers (SauceLabs, BrowserStack).

## 2. Core Capabilities & Responsibilities

- **Distributed Parallel Execution**: Runs test suites concurrently across diverse browser and OS configurations.
- **TOML Stereotype & Slot Management**: Defines node browser versions, slot capacity, and capability matching.
- **Remote File Downloading (`se:downloadsEnabled`)**: Manages and retrieves downloaded files from remote grid nodes.

## 3. Why Use It?

Running large enterprise test suites sequentially on a local machine takes hours. Grid 4 infrastructure reduces execution time to minutes and integrates seamlessly into CI/CD pipelines.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                   | Anti-Pattern                                                                                  |
| :---------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| **Guaranteed Session Teardown**: Always invoke `driver.quit()` in `finally` or teardown blocks. | **Orphan Sessions**: Omitting `quit()`, locking Grid node slots and leaking container memory. |
| **Grid Observability**: Enable OpenTelemetry tracing across Grid 4 nodes.                       | **Unmonitored Nodes**: Running Grid infrastructure without monitoring node slot utilization.  |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_se_grid_docs`
- **Parameters**: `language` (`java` | `python` | `typescript` | `javascript` | `csharp` | `ruby`)
