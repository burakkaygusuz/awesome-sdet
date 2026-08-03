---
name: selenium-observability
description: Guide for Selenium 4 OpenTelemetry observability, client-side tracing, Jaeger/OTLP exporters, and Grid 4 GraphQL API querying. Trigger on OpenTelemetry, telemetry, tracing, Jaeger, Zipkin, OTLP, Grid GraphQL API, or monitoring Selenium test execution.
metadata:
  keywords:
    ['selenium', 'opentelemetry', 'tracing', 'jaeger', 'graphql', 'observability', 'testing']
---

# Observability & OpenTelemetry Tracing — Selenium Java

## Source & scope

Condensed from official Selenium documentation (`selenium.dev/documentation/grid/advanced_features/observability/`). Explains how to instrument client-side OpenTelemetry tracing and query Grid 4 GraphQL API.

## Core concepts

Selenium 4 integrates OpenTelemetry for distributed tracing. Traces record the complete request lifecycle across client calls, Grid Routers, Distributors, and Nodes.

## Client-Side OpenTelemetry Configuration

Set system properties before instantiating `RemoteWebDriver`:

```java
System.setProperty("otel.traces.exporter", "jaeger");
System.setProperty("otel.exporter.jaeger.endpoint", "http://jaeger-host:14250");
System.setProperty("otel.resource.attributes", "service.name=sdet-selenium-client");

ChromeOptions options = new ChromeOptions();
WebDriver driver = new RemoteWebDriver(new URL("http://grid-hub:4444/"), options);
driver.get("https://example.com");
driver.quit();
```

## Grid 4 GraphQL API Querying

Query live Grid status and node session allocations programmatically via `/graphql`:

```graphql
query GridState {
  grid {
    totalSlots
    usedSlots
    sessionCount
  }
}
```

```java
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://grid-hub:4444/graphql"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString("{\"query\": \"query GridState { grid { totalSlots usedSlots sessionCount } }\"}"))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
System.out.println("Grid Status: " + response.body());
```

## Dynamic MCP Support & Reference (Optional)

This skill is fully self-contained. If the `sdet-mcp` server is available in your workspace, you can dynamically query observability code references via the `read_se_observability_docs` tool.
