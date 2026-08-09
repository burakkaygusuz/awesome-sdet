# Selenium Observability & OpenTelemetry Tracing — Python API Reference (Selenium 4.x+)

> Official Selenium 4 OpenTelemetry integration and Grid 4 GraphQL observability API.

---

## 1. OpenTelemetry Tracing Configuration

```python
import os
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

def run_traced_session() -> None:
    # Set OpenTelemetry environment variables before initializing driver
    os.environ["OTEL_TRACES_EXPORTER"] = "otlp"
    os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = "http://jaeger-host:4317"
    os.environ["OTEL_SERVICE_NAME"] = "selenium-python-client"

    options = Options()
    driver = webdriver.Remote(
        command_executor="http://grid-hub:4444",
        options=options
    )
    try:
        driver.get("https://example.com")
    finally:
        driver.quit()
```

---

## 2. Grid 4 GraphQL API Querying

```python
from typing import Any
import requests

def get_grid_status(grid_url: str = "http://grid-hub:4444") -> dict[str, Any]:
    query = """
    query GridState {
      grid {
        totalSlots
        usedSlots
        sessionCount
      }
    }
    """
    response = requests.post(
        f"{grid_url}/graphql",
        json={"query": query},
        headers={"Content-Type": "application/json"}
    )
    return response.json()

if __name__ == "__main__":
    status = get_grid_status()
    print("Grid Status:", status)
```

---

## Best Practices

- **Environment Variables**: Configure OpenTelemetry tracing environment variables prior to instantiating `webdriver.Remote`.
- **GraphQL Polling**: Query Grid `/graphql` endpoint for telemetry monitoring and slot health checks rather than legacy `/status` endpoints.
