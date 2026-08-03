# RemoteWebDriver & Enterprise Selenium Grid 4 — Java API Reference

## Code Examples

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.HasDownloads;
import java.net.URL;
import java.util.List;

// 1. Basic RemoteWebDriver Setup
ChromeOptions options = new ChromeOptions();
options.setCapability("se:downloadsEnabled", true);

WebDriver driver = new RemoteWebDriver(new URL("http://localhost:4444/"), options);

// 2. Custom Node Stereotype Matching (TOML Grid Configuration)
options.setCapability("networkname:applicationName", "node_1");
options.setCapability("nodename:applicationName", "app_1");

// 3. Remote File Downloading
List<String> downloadableFiles = ((HasDownloads) driver).getDownloadableFiles();
```

## Best Practices & Scaling

- **Enable Remote File Downloads**: Pass capability `se:downloadsEnabled = true` to allow fetching files dynamically from Grid nodes.
- **KEDA Auto-Scaling**: Integrate Kubernetes Event-driven Autoscaling (KEDA) with Selenium Grid 4 GraphQL metrics `/graphql` to scale Node pods dynamically based on pending requests.
- **Session Cleanup**: Always invoke `driver.quit()` to release active Grid slots.
