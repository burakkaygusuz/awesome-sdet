---
name: selenium-java-grid-remote
description: Reference and implementation guide for Selenium 4 RemoteWebDriver, Selenium Grid 4 Hub/Node/Distributed execution, remote file downloading (se:downloadsEnabled), custom TOML stereotypes, KEDA Kubernetes auto-scaling, and Cloud Grid integrations (SauceLabs, BrowserStack). Trigger on RemoteWebDriver, Selenium Grid 4, remote downloading, cloud grid, or scaling grid execution.
metadata:
  keywords: ['selenium', 'java', 'remotewebdriver', 'selenium-grid', 'cloud-grid', 'testing']
---

# RemoteWebDriver & Enterprise Selenium Grid 4 — Java

## Source & scope

Condensed from official Selenium documentation (`selenium.dev/documentation/grid/`). Covers RemoteWebDriver configuration, Grid 4 capabilities, remote file downloading, TOML node matching, and cloud grid setups. Code examples use Selenium 4 and Java 17+.

## Core concepts

`RemoteWebDriver` connects a client test script to a remote browser running on a Selenium Grid 4 Hub/Router or Cloud Grid provider.

### Basic RemoteWebDriver Setup

```java
URL gridUrl = new URL("http://localhost:4444/");
ChromeOptions options = new ChromeOptions();
options.setCapability("se:downloadsEnabled", true);

WebDriver driver = new RemoteWebDriver(gridUrl, options);
driver.get("https://example.com");
driver.quit();
```

## Advanced Features & Recipes

### Recipe 1 — Remote File Downloading

Enable `se:downloadsEnabled` capability to retrieve files downloaded on remote Grid nodes directly to the client:

```java
ChromeOptions options = new ChromeOptions();
options.setCapability("se:downloadsEnabled", true);
WebDriver driver = new RemoteWebDriver(new URL("http://localhost:4444/"), options);

driver.get("https://the-internet.herokuapp.com/download");
driver.findElement(By.linkText("some-file.txt")).click();

// Access downloaded file contents from RemoteWebDriver session
List<String> files = ((HasDownloads) driver).getDownloadableFiles();
```

### Recipe 2 — Custom Node Stereotype Matching

Set custom capability stereotypes matching Grid node TOML configurations:

```java
FirefoxOptions options = new FirefoxOptions();
options.setCapability("networkname:applicationName", "node_1");
options.setCapability("nodename:applicationName", "app_1");
options.setPlatformName("Linux");

WebDriver driver = new RemoteWebDriver(new URL("http://grid-hub:4444/"), options);
```

## Best practices

1. **Always enable `se:downloadsEnabled`**: Avoid SSH/FTP workarounds for inspecting files generated during remote browser runs.
2. **Always call `driver.quit()`**: Unclosed RemoteWebDriver sessions leak active slots on the Grid Hub.
3. **Use Browser Options over DesiredCapabilities**: Selenium 4 deprecates `DesiredCapabilities` in favor of typed `ChromeOptions`/`FirefoxOptions`.

## Dynamic MCP Support & Reference (Optional)

This skill is fully self-contained. If the `sdet-mcp` server is available in your workspace, you can dynamically query multi-language RemoteWebDriver code references via the `read_se_grid_docs` tool.
