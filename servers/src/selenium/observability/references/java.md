# Java Reference — Selenium Observability & OpenTelemetry Tracing

## OpenTelemetry Tracing Configuration

Selenium 4 includes built-in OpenTelemetry support for tracking end-to-end driver session commands.

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import java.net.URL;

public class ObservabilityExample {
    public static void main(String[] args) throws Exception {
        // Set OpenTelemetry system properties before session startup
        System.setProperty("otel.traces.exporter", "jaeger");
        System.setProperty("otel.exporter.jaeger.endpoint", "http://jaeger-host:14250");
        System.setProperty("otel.resource.attributes", "service.name=sdet-selenium-client");

        ChromeOptions options = new ChromeOptions();
        WebDriver driver = new RemoteWebDriver(new URL("http://grid-hub:4444/"), options);

        driver.get("https://example.com");
        driver.quit();
    }
}
```

## Grid 4 GraphQL API Querying

Query live grid status, active sessions, and slot allocations using `/graphql`:

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
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

public class GraphQLQueryExample {
    public static void queryGrid() throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        String query = "{\"query\": \"query GridState { grid { totalSlots usedSlots sessionCount } }\"}";

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("http://grid-hub:4444/graphql"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(query))
            .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        System.out.println("Grid Status: " + response.body());
    }
}
```
