# TypeScript API Reference — Selenium Observability & OpenTelemetry Tracing

## OpenTelemetry Tracing Configuration

Configure OpenTelemetry environment variables for TypeScript Selenium WebDriver scripts:

```typescript
import { Builder } from 'selenium-webdriver';
import process from 'node:process';

process.env.OTEL_TRACES_EXPORTER = 'otlp';
process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://jaeger-host:4317';
process.env.OTEL_SERVICE_NAME = 'selenium-ts-client';

async function run() {
  const driver = await new Builder()
    .forBrowser('chrome')
    .usingServer('http://grid-hub:4444')
    .build();

  try {
    await driver.get('https://example.com');
  } finally {
    await driver.quit();
  }
}

run();
```

## Grid 4 GraphQL API Querying

Query Grid status using `fetch`:

```typescript
interface GridResponse {
  data: {
    grid: {
      totalSlots: number;
      usedSlots: number;
      sessionCount: number;
    };
  };
}

async function queryGridStatus(hubUrl = 'http://grid-hub:4444'): Promise<GridResponse> {
  const query = `
    query GridState {
      grid {
        totalSlots
        usedSlots
        sessionCount
      }
    }
  `;

  const res = await fetch(`${hubUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });

  return (await res.json()) as GridResponse;
}
```
