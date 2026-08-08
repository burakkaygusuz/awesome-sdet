---
name: selenium-observability
description: 'OpenTelemetry client-side tracing, Jaeger/OTLP exporters, and Grid 4 GraphQL metrics. Trigger on OpenTelemetry, tracing, Jaeger, or Grid GraphQL.'
user-invocable: true
license: MIT
compatibility: Selenium 4.0+
metadata:
  framework: selenium
  keywords:
    - opentelemetry
    - client-tracing
    - jaeger-otlp
    - grid-graphql-metrics
---

# Observability & OpenTelemetry Tracing Architecture

## 1. What Is It?

Selenium 4 Observability integrates OpenTelemetry (OTel) standards for distributed tracing across test clients and Selenium Grid 4 nodes.

## 2. Core Capabilities & Responsibilities

- **Distributed Tracing**: Uses `traceparent` headers to trace request paths from client code through Grid Routers, Distributors, Nodes, and browser drivers.
- **GraphQL Metrics Querying**: Queries live Grid state, slot allocations, and active session counts via the `/graphql` endpoint.

## 3. Why Use It?

Allows diagnosing performance bottlenecks, session timeouts, and infrastructure issues during large-scale parallel test execution via visual tracing dashboards (Jaeger/Zipkin).

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                                  | Anti-Pattern                                                                         |
| :------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Standard Exporter Vars**: Configure exporters using standard environment variables (`OTEL_TRACES_EXPORTER`). | **Hardcoded Endpoints**: Hardcoding tracing collector URLs inside test code.         |
| **Pre-Flight Slot Querying**: Verify Grid slot availability via GraphQL prior to spawning parallel test runs.  | **Blind Execution**: Overloading Grid Hub capacity without checking available slots. |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_se_observability_docs`
- **Parameters**: `language` (`java` | `python` | `typescript` | `javascript` | `csharp` | `ruby`)
