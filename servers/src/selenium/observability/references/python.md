# Python API Reference — Selenium Observability & OpenTelemetry Tracing

## OpenTelemetry Tracing Configuration

Configure OpenTelemetry environment variables for Python Selenium clients:

```python
import os
import requests
from selenium import webdriver
from selenium.webdriver.chrome.options import Options

# Set OpenTelemetry environment variables before initializing driver
os.environ["OTEL_TRACES_EXPORTER"] = "otlp"
os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = "http://jaeger-host:4317"
os.environ["OTEL_SERVICE_NAME"] = "selenium-python-client"

options = Options()
driver = webdriver.Remote(
    command_executor="http://grid-hub:4444",
    options=options
)

driver.get("https://example.com")
driver.quit()
```

## Grid 4 GraphQL API Querying

Query Grid status using Python `requests`:

```python
import requests

def get_grid_status(grid_url: str = "http://grid-hub:4444"):
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
