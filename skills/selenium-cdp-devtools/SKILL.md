---
name: selenium-cdp-devtools
description: Use for Java Selenium tasks involving Chrome DevTools Protocol (CDP) — cookies via CDP, network request/response interception or stubbing, basic-auth injection, console log/JS exception capture, DOM mutation listening, script pinning, performance metrics, or waiting on downloads. Trigger on mentions of DevTools, CDP, HasDevTools, NetworkInterceptor, org.openqa.selenium.devtools, or a bare CDP domain/method (e.g. "Network.setCookie", "Performance.getMetrics") even without "Selenium" mentioned. Also use for the full class/method list of org.openqa.selenium.devtools. Java bindings only (ChromeDriver/EdgeDriver/Chromium drivers); CDP is being phased out for WebDriver BiDi.
metadata:
  keywords: ['selenium', 'cdp', 'devtools', 'chrome-devtools-protocol', 'java', 'testing']
---

# Selenium Chrome DevTools Protocol (CDP) — Java

## Scope and source

Java bindings for `org.openqa.selenium.devtools`, condensed from the [official Selenium docs](https://www.selenium.dev/documentation/webdriver/bidi/cdp/) and [Javadoc](https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/devtools/package-summary.html). This file covers the everyday recipes; [`references/api-references.md`](references/api-references.md) has the complete class and method listing — read it only when you need an exact signature, an overload, or a class not covered by a recipe below.

**CDP is a stopgap, not the long-term API.** CDP has no stable contract across Chrome versions and only works on Chromium-based browsers (Chrome, Edge). Selenium is migrating this functionality to the cross-browser, standards-based **WebDriver BiDi** protocol. If the user's task doesn't specifically require CDP-only features, mention that the BiDi equivalents
`org.openqa.selenium.bidi.*`, e.g. `Network`, `Log`, `Script` under the BiDi package) are the forward-looking choice — but CDP remains the only option for Performance metrics, script pinning, and a few other domains BiDi hasn't covered yet.

## Core building blocks

| Type                                | Role                                                                                                                                                                                                  |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HasDevTools`                       | Interface implemented by `ChromeDriver`/`EdgeDriver`. Cast the driver to get a `DevTools` session.                                                                                                    |
| `DevTools`                          | The session handle: `send(Command<X>)`, `addListener(Event<X>, handler)`, `createSession()`.                                                                                                          |
| `Command<X>`                        | One CDP method call with a typed response. Usually obtained from generated domain classes like `Network.setCookie(...)`, `Performance.getMetrics()` — not built by hand.                              |
| `Event<X>`                          | One CDP event subscription, e.g. `Browser.downloadProgress()`, or higher-level helpers in `org.openqa.selenium.devtools.events.CdpEventTypes` (`consoleEvent`, `domMutation`, `javascriptException`). |
| `NetworkInterceptor`                | The recommended way to stub/record/transform HTTP traffic — wraps CDP behind a plain `Filter`/`Routable` API.                                                                                         |
| `HasCdp`                            | Simplest entry point — `executeCdpCommand(String, Map)` for one-off commands with no typed response needed.                                                                                           |
| `HasAuthentication`, `HasLogEvents` | Driver-level convenience interfaces layered on top of CDP for auth and log/event capture.                                                                                                             |

Pick the simplest tool for the job: `HasCdp` for a single fire-and-forget command,
`NetworkInterceptor` for anything touching requests/responses, a full `DevTools` session
(`getDevTools()` + `createSession()`) for typed commands, listeners, or performance data.

## Recipe 1 — One-off CDP command (simplest option)

Use `HasCdp.executeCdpCommand` when you just need to fire a single command and don't need a typed
response or an ongoing session — e.g. setting a cookie before the CDP session bookkeeping is
worth the overhead.

```java
Map<String, Object> cookie = new HashMap<>();
cookie.put("name", "cheese");
cookie.put("value", "gouda");
cookie.put("domain", "www.selenium.dev");
cookie.put("secure", true);
((HasCdp) driver).executeCdpCommand("Network.setCookie", cookie);
```

## Recipe 2 — Full DevTools session with typed commands

Use this when you want typed request/response objects (avoids hand-building raw parameter maps),
need multiple commands in one session, or need a domain that isn't exposed via a convenience
interface (e.g. `Performance`).

```java
DevTools devTools = ((HasDevTools) driver).getDevTools();
devTools.createSession();                       // required before sending most commands

devTools.send(Performance.enable(Optional.empty()));
List<Metric> metricList = devTools.send(Performance.getMetrics());

Map<String, Number> metrics = new HashMap<>();
for (Metric metric : metricList) {
  metrics.put(metric.getName(), metric.getValue());
}
```

Setting a cookie the typed way (compare to Recipe 1 — same effect, more verbose, but every
parameter is compiler-checked):

```java
devTools.send(
    Network.setCookie(
        "cheese", "gouda",
        Optional.<String>empty(), Optional.of("www.selenium.dev"), Optional.<String>empty(),
        Optional.of(true), Optional.<Boolean>empty(), Optional.<CookieSameSite>empty(),
        Optional.<TimeSinceEpoch>empty(), Optional.<CookiePriority>empty(),
        Optional.<CookieSourceScheme>empty(), Optional.<Integer>empty(),
        Optional.<CookiePartitionKey>empty()));
```

`Network`, `Performance`, `Browser`, etc. come from a version-pinned package — see
[Picking a CDP version](#picking-a-cdp-version) below.

## Recipe 3 — Capturing console logs and JS exceptions

Use `HasLogEvents` with the version-independent helpers in `CdpEventTypes` — this avoids coupling
your test to one CDP version's `Runtime`/`Log` domain classes.

```java
import static org.openqa.selenium.devtools.events.CdpEventTypes.consoleEvent;

CopyOnWriteArrayList<String> messages = new CopyOnWriteArrayList<>();
((HasLogEvents) driver).onLogEvent(consoleEvent(e -> messages.add(e.getMessages().get(0))));

driver.findElement(By.id("consoleLog")).click();
wait.until(_d -> messages.size() > 0);
```

Same pattern for uncaught exceptions with `CdpEventTypes.javascriptException(...)`. Use a
thread-safe collection (`CopyOnWriteArrayList`) because the listener fires on a background
thread, not the main test thread — plain `ArrayList` will throw `ConcurrentModificationException`
under load.

## Recipe 4 — DOM mutation events

Same `HasLogEvents` mechanism, different event type — useful for detecting when JS frameworks
reveal/insert elements without a fixed wait:

```java
import static org.openqa.selenium.devtools.events.CdpEventTypes.domMutation;

CopyOnWriteArrayList<WebElement> mutations = new CopyOnWriteArrayList<>();
((HasLogEvents) driver).onLogEvent(domMutation(e -> mutations.add(e.getElement())));

driver.findElement(By.id("reveal")).click();
wait.until(_d -> !mutations.isEmpty());
```

## Recipe 5 — Network interception (record, transform, redirect)

`NetworkInterceptor` is an `AutoCloseable` — always scope it with try-with-resources so
interception is torn down deterministically; leaving it open bleeds into later tests on the same
driver session.

**Record response headers without changing them** (pass a `Filter`):

```java
CopyOnWriteArrayList<String> contentType = new CopyOnWriteArrayList<>();

try (NetworkInterceptor ignored =
    new NetworkInterceptor(
        driver,
        (Filter) next -> req -> {
          HttpResponse res = next.execute(req);
          contentType.add(res.getHeader("Content-Type"));
          return res;
        })) {
  driver.get("https://www.selenium.dev/selenium/web/blank.html");
  wait.until(_d -> contentType.size() > 0);
}
```

**Stub every response with fixed content** (pass a `Route`/`Routable` — matches specific requests,
everything else proceeds unmodified via `NetworkInterceptor.PROCEED_WITH_REQUEST`):

```java
try (NetworkInterceptor ignored =
    new NetworkInterceptor(
        driver,
        Route.matching(req -> true)
            .to(() -> req -> new HttpResponse()
                .setStatus(200)
                .addHeader("Content-Type", MediaType.HTML_UTF_8.toString())
                .setContent(Contents.utf8String("Creamy, delicious cheese!"))))) {
  driver.get("https://www.selenium.dev/selenium/web/blank.html");
}
```

**Rewrite an outgoing request URL** (also a `Filter` — mutate `req` before calling `next.execute`):

```java
try (NetworkInterceptor ignored =
    new NetworkInterceptor(
        driver,
        (Filter) next -> req -> {
          if (req.getUri().contains("one.js")) {
            req = new HttpRequest(HttpMethod.GET, req.getUri().replace("one.js", "two.js"));
          }
          return next.execute(req);
        })) {
  driver.get("https://www.selenium.dev/selenium/web/devToolsRequestInterceptionTest.html");
  driver.findElement(By.tagName("button")).click();
}
```

Choosing between the three `NetworkInterceptor` constructors: use `Filter` when you need the real
network call to happen (recording, or modify-then-forward); use `Routable`/`Route.matching(...)`
when you want to stub specific URL patterns entirely and leave everything else alone; use the raw
`HttpHandler` constructor only when you want total control and are handling routing yourself.

## Recipe 6 — Basic authentication injection

Use `HasAuthentication` instead of embedding `user:pass@host` in the URL — browsers stopped
honoring credentials in the URL. `register` takes a `Predicate<URI>` (which requests should get
credentials) and a `Supplier<Credentials>`:

```java
Predicate<URI> uriPredicate = uri -> uri.toString().contains("herokuapp.com");
Supplier<Credentials> authentication = UsernameAndPassword.of("admin", "admin");
((HasAuthentication) driver).register(uriPredicate, authentication);

driver.get("https://the-internet.herokuapp.com/basic_auth");
```

## Recipe 7 — Script pinning

Use `JavascriptExecutor.pin` when the same script runs many times (e.g. inside a wait loop or a
custom locator) — it avoids re-parsing/re-sending the script body on every call, and the returned
`ScriptKey` is reused instead of the script string:

```java
ScriptKey key = ((JavascriptExecutor) driver).pin("return arguments;");
List<Object> arguments =
    (List<Object>) ((JavascriptExecutor) driver).executeScript(key, 1, true, element);
```

## Recipe 8 — Waiting for a browser-driven download

Combine a raw `DevTools` session with `Browser.setDownloadBehavior` and the
`Browser.downloadProgress()` event — there's no higher-level convenience interface for this one:

```java
DevTools devTools = ((HasDevTools) driver).getDevTools();
devTools.createSession();

devTools.send(
    Browser.setDownloadBehavior(
        Browser.SetDownloadBehaviorBehavior.ALLOWANDNAME,
        Optional.empty(), Optional.of(""), Optional.of(true)));

AtomicBoolean completed = new AtomicBoolean(false);
devTools.addListener(
    Browser.downloadProgress(),
    e -> completed.set(Objects.equals(e.getState().toString(), "completed")));

driver.findElement(By.id("file-2")).click();
wait.until(_d -> completed.get());
```

## Picking a CDP version

Command/event domain classes (`Network`, `Performance`, `Browser`, `Page`, ...) live under a
Chrome-version-pinned package (e.g. `org.openqa.selenium.devtools.v150.network.Network`) or the stable alias package `org.openqa.selenium.devtools.latest.*` (provided by the `selenium-devtools-latest` artifact, e.g. `import org.openqa.selenium.devtools.latest.network.Network;`).

Using `org.openqa.selenium.devtools.latest` is recommended to avoid updating import paths on every Chrome version bump. If using version-pinned packages directly, Selenium supports the 3 most recent Chrome versions at a time — check the installed Selenium version's Javadoc for the active `vNNN` package. `CdpVersionFinder`/`CdpInfo` (see [`references/api-references.md`](references/api-references.md)) handle this matching automatically inside `getDevTools()`.

## Cleanup checklist

- `DevTools` implements `Closeable` — close it (or let the driver's `quit()` handle it) when done with a manual session.
- `NetworkInterceptor` implements `AutoCloseable` — always try-with-resources; an open interceptor keeps intercepting for the rest of the driver session.
- `devTools.clearListeners()` removes all registered event handlers if you need to stop listening without closing the session.

## Known limitations (per Selenium docs)

- **Geolocation override** — CDP can set an emulated geolocation, but most real sites resolve
  location from IP address instead, so this rarely produces the intended effect in tests.
- **Device metrics override** — prefer Chrome's built-in Mobile Emulation in `ChromeOptions`
  over CDP device-metric overrides; the Options API is purpose-built for this and more reliable.
- CDP methods/params can change between Chrome versions with no deprecation warning — pin CI to a
  specific Chrome version if a test depends on exact CDP behavior.

## Full API reference

[`references/api-references.md`](references/api-references.md) — every class and interface in `org.openqa.selenium.devtools` with
full method signatures, constructors, and short descriptions (`DevTools`, `HasDevTools`,
`Command<X>`, `Event<X>`, `Connection`, `SeleniumCdpConnection`, `NetworkInterceptor`,
`CdpVersionFinder`, `CdpInfo`, `CdpEndpointFinder`, `Message`, `Reply`, `ConverterFunctions`,
`DevToolsException`, `RequestFailedException`, `DevToolsProvider`).
