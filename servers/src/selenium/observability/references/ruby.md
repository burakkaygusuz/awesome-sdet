# Selenium Observability & OpenTelemetry Tracing — Ruby API Reference (Selenium 4.46.0+)

> OpenTelemetry environment integration & Selenium Grid 4 GraphQL observability.

---

## OpenTelemetry Tracing Configuration

Configure OpenTelemetry environment variables for Ruby Selenium scripts:

```ruby
# frozen_string_literal: true

require 'selenium-webdriver'

ENV['OTEL_TRACES_EXPORTER'] = 'otlp'
ENV['OTEL_EXPORTER_OTLP_ENDPOINT'] = 'http://jaeger-host:4317'
ENV['OTEL_SERVICE_NAME'] = 'selenium-ruby-client'

options = Selenium::WebDriver::Options.chrome
driver = Selenium::WebDriver.for(:remote, url: 'http://grid-hub:4444', options: options)

begin
  driver.get('https://example.com')
ensure
  driver&.quit
end
```

## Grid 4 GraphQL API Querying

Query Grid status using standard `Net::HTTP`:

```ruby
# frozen_string_literal: true

require 'net/http'
require 'json'
require 'uri'

def query_grid_status(hub_url = 'http://grid-hub:4444')
  uri = URI("#{hub_url}/graphql")
  headers = { 'Content-Type' => 'application/json' }
  query_payload = {
    query: 'query GridState { grid { totalSlots usedSlots sessionCount } }'
  }.to_json

  response = Net::HTTP.post(uri, query_payload, headers)
  puts "Grid Status: #{response.body}"
end
```

## Best Practices

- **String Header Keys**: Always use String keys (`'Content-Type' => 'application/json'`) in `Net::HTTP` headers instead of Symbol keys.
- **Automated HTTP Teardown**: Use high-level `Net::HTTP.post(uri, body, headers)` to automatically manage HTTP TCP socket opening and teardown.
- **URI Initialization**: Prefer `URI("http://...")` over deprecated `URI.parse`.
