# Ruby API Reference — Selenium Observability & OpenTelemetry Tracing

## OpenTelemetry Tracing Configuration

Configure OpenTelemetry environment variables for Ruby Selenium scripts:

```ruby
require 'selenium-webdriver'
require 'net/http'
require 'json'
require 'uri'

ENV['OTEL_TRACES_EXPORTER'] = 'otlp'
ENV['OTEL_EXPORTER_OTLP_ENDPOINT'] = 'http://jaeger-host:4317'
ENV['OTEL_SERVICE_NAME'] = 'selenium-ruby-client'

options = Selenium::WebDriver::Options.chrome
driver = Selenium::WebDriver.for(:remote, url: 'http://grid-hub:4444', options: options)

begin
  driver.get('https://example.com')
ensure
  driver.quit
end
```

## Grid 4 GraphQL API Querying

Query Grid status using `Net::HTTP`:

```ruby
def query_grid_status(hub_url = 'http://grid-hub:4444')
  uri = URI.parse("#{hub_url}/graphql")
  header = {'Content-Type': 'application/json'}
  query = {
    query: 'query GridState { grid { totalSlots usedSlots sessionCount } }'
  }

  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Post.new(uri.request_uri, header)
  request.body = query.to_json

  response = http.request(request)
  puts "Grid Status: #{response.body}"
end
```
