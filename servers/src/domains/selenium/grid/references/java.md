# RemoteWebDriver & Enterprise Selenium Grid 4 — Java API Reference (Selenium 4.x+)

## Code Examples

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.HasDownloads;
import java.net.URI;
import java.util.List;

ChromeOptions options = new ChromeOptions();
options.setCapability("se:downloadsEnabled", true);
options.setCapability("networkname:applicationName", "node_1");
options.setCapability("nodename:applicationName", "app_1");

WebDriver driver = new RemoteWebDriver(URI.create("http://localhost:4444/").toURL(), options);
try {
    driver.get("https://example.com");
    List<String> downloadableFiles = ((HasDownloads) driver).getDownloadableFiles();
} finally {
    driver.quit();
}
```

## Best Practices & Scaling

- **Enable Remote File Downloads**: Pass capability `se:downloadsEnabled = true` to allow fetching files dynamically from Grid nodes.
- **KEDA Auto-Scaling**: Integrate Kubernetes Event-driven Autoscaling (KEDA) with Selenium Grid 4 GraphQL metrics `/graphql` to scale Node pods dynamically based on pending requests.
- **Session Cleanup**: Always invoke `driver.quit()` to release active Grid slots.
