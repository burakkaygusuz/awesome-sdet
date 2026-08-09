# Selenium Observability & OpenTelemetry Tracing — C# API Reference (Selenium 4.x+)

## OpenTelemetry Tracing Configuration

Configure OpenTelemetry environment variables for C# Selenium WebDriver applications:

```csharp
using System;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Remote;

namespace SeleniumObservability
{
    class Program
    {
        static void Main(string[] args)
        {
            Environment.SetEnvironmentVariable("OTEL_TRACES_EXPORTER", "otlp");
            Environment.SetEnvironmentVariable("OTEL_EXPORTER_OTLP_ENDPOINT", "http://jaeger-host:4317");
            Environment.SetEnvironmentVariable("OTEL_SERVICE_NAME", "selenium-csharp-client");

            ChromeOptions options = new ChromeOptions();
            IWebDriver driver = new RemoteWebDriver(new Uri("http://grid-hub:4444"), options);

            try
            {
                driver.Navigate().GoToUrl("https://example.com");
            }
            finally
            {
                driver.Quit();
            }
        }
    }
}
```

## Grid 4 GraphQL API Querying

Query Grid status using `HttpClient` in C#:

```csharp
using System;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace SeleniumObservability
{
    public class GridMonitor
    {
        public static async Task QueryGridAsync(string hubUrl = "http://grid-hub:4444")
        {
            using var client = new HttpClient();
            string jsonBody = "{\"query\": \"query GridState { grid { totalSlots usedSlots sessionCount } }\"}";
            var content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

            var response = await client.PostAsync($"{hubUrl}/graphql", content);
            string responseString = await response.Content.ReadAsStringAsync();
            Console.WriteLine("Grid Status: " + responseString);
        }
    }
}
```
