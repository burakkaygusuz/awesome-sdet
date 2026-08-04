---
name: selenium-java-bidi
description: Use for Java Selenium tasks involving W3C WebDriver BiDirectional (BiDi) protocol — bidirectional event listening, BiDi network interception, console/JS log monitoring via LogInspector, window/tab browsing context management, or async script evaluation. Trigger on mentions of BiDi, WebDriver BiDi, LogInspector, NetworkInspector, BrowsingContext, org.openqa.selenium.bidi, or cross-browser bidirectional automation replacing CDP.
metadata:
  keywords: ['selenium', 'bidi', 'webdriver-bidi', 'java', 'testing']
---

# WebDriver BiDi Protocol — Selenium Java

## Source & scope

Condensed from official Selenium documentation (`selenium.dev/documentation/webdriver/bidi/`) and Javadoc for `org.openqa.selenium.bidi.*`. BiDi is the official W3C standard for bidirectional browser automation, supported across all major browsers (Chrome, Edge, Firefox). Code examples use Selenium 4 (4.46.0+) and JUnit 5 (`org.junit.jupiter.api.Assertions`).

## Core building blocks

| Type              | Role                                                                                                              |
| :---------------- | :---------------------------------------------------------------------------------------------------------------- |
| `HasBiDi`         | Interface implemented by `RemoteWebDriver` and browser drivers supporting BiDi (`((HasBiDi) driver).getBiDi()`).  |
| `BiDi`            | Session handle managing bidirectional connection, domain creation, and event subscriptions.                       |
| `LogInspector`    | Inspector for browser console logs, JS exceptions, and system events (`onConsoleEntry`, `onJavaScriptException`). |
| `Network` (BiDi)  | W3C standard network interception domain (`addIntercept`, `continueWithAuth`, `continueRequest`).                 |
| `BrowsingContext` | Handle for tabs/windows context inspection, navigation events, and element screenshots.                           |
| `Script`          | BiDi domain for executing async JavaScript and subscribing to channel messages.                                   |

## BiDi Session Initialization (Prerequisite)

WebDriver BiDi requires enabling the WebSocket connection in browser options before session creation:

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.CapabilityType;

ChromeOptions options = new ChromeOptions();
// Using official Selenium CapabilityType constant (or "webSocketUrl")
options.setCapability(CapabilityType.ENABLE_BIDI, true);

WebDriver driver = new ChromeDriver(options);
```

## Recipe 1 — Monitoring console logs and JS exceptions with LogInspector

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.bidi.module.LogInspector;
import org.openqa.selenium.bidi.log.ConsoleLogEntry;
import java.util.concurrent.CopyOnWriteArrayList;

ChromeOptions options = new ChromeOptions();
options.setCapability(CapabilityType.ENABLE_BIDI, true);
WebDriver driver = new ChromeDriver(options);

LogInspector logInspector = new LogInspector(driver);
CopyOnWriteArrayList<ConsoleLogEntry> logs = new CopyOnWriteArrayList<>();

logInspector.onConsoleEntry(entry -> logs.add(entry));
driver.get("https://example.com");

Assertions.assertFalse(logs.isEmpty());
```

## Recipe 2 — Network request interception via BiDi

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.bidi.module.Network;
import org.openqa.selenium.bidi.network.AddInterceptParameters;
import org.openqa.selenium.bidi.network.InterceptPhase;

ChromeOptions options = new ChromeOptions();
options.setCapability(CapabilityType.ENABLE_BIDI, true);
WebDriver driver = new ChromeDriver(options);

Network network = new Network(driver);
network.addIntercept(new AddInterceptParameters(InterceptPhase.BEFORE_REQUEST_SENT));

network.onRequestSent(request -> {
    System.out.println("URL: " + request.getRequest().getUrl());
});
```

## Recipe 3 — BrowsingContext navigation and context inspection

```java
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.bidi.browsingcontext.BrowsingContext;

ChromeOptions options = new ChromeOptions();
options.setCapability(CapabilityType.ENABLE_BIDI, true);
WebDriver driver = new ChromeDriver(options);

String currentHandle = driver.getWindowHandle();
BrowsingContext context = new BrowsingContext(driver, currentHandle);

context.navigate("https://example.com");
Assertions.assertNotNull(context.getId());
```

## Dynamic MCP Support & Reference (Optional)

This skill is fully self-contained. If the `sdet-mcp` server is available in your workspace, you can dynamically query multi-language W3C WebDriver BiDi code references and documentation via the `read_se_bidi_docs` tool.
