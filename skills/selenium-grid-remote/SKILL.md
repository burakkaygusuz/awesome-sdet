---
name: selenium-grid-remote
description: Architecture guide for RemoteWebDriver, enterprise Selenium Grid 4 infrastructure, cloud grid execution, TOML node stereotypes, and containerized browser scaling. Trigger on RemoteWebDriver, Selenium Grid, Grid 4, TOML stereotypes, cloud grid, or remote browser execution.
metadata:
  keywords: ['selenium', 'remotewebdriver', 'selenium-grid', 'cloud-grid', 'testing']
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
