# Selenium Observability & OpenTelemetry Tracing — JavaScript API Reference (Selenium 4.x+)

## OpenTelemetry Tracing Configuration

Configure OpenTelemetry environment variables for JavaScript Selenium WebDriver scripts:

```javascript
const { Builder } = require('selenium-webdriver');

process.env.OTEL_TRACES_EXPORTER = 'otlp';
process.env.OTEL_EXPORTER_OTLP_ENDPOINT = 'http://jaeger-host:4317';
process.env.OTEL_SERVICE_NAME = 'selenium-js-client';

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

```javascript
async function queryGridStatus(hubUrl = 'http://grid-hub:4444') {
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

  return await res.json();
}
```
