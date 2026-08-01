# API Reference — `org.openqa.selenium.devtools` (Java bindings)

Complete class/interface/method listing for the Selenium Java CDP package, condensed from the
official Javadoc (`https://www.selenium.dev/selenium/docs/api/java/org/openqa/selenium/devtools/package-summary.html`).
Read this file when you need an exact method signature, a constructor overload, or a class you
haven't used before. For ready-to-use code patterns, see `SKILL.md` first — most everyday tasks
don't require reading this file at all.

Related sibling packages (not detailed here, only referenced where relevant):
`org.openqa.selenium.devtools.events` (CDP→Selenium event adapters, e.g. `CdpEventTypes`),
`org.openqa.selenium.devtools.idealized` (`Domains`, per-version domain wiring, `SessionID`),
`org.openqa.selenium.devtools.noop` (no-op fallback implementations, e.g. `NoOpCdpInfo`).

---

## Table of contents

1. [DevTools](#devtools) — the session handle; send commands, register event listeners
2. [HasDevTools](#hasdevtools) — interface implemented by `ChromeDriver` / `EdgeDriver` / etc.
3. [Command\<X\>](#commandx) — a CDP method call + params + response mapper
4. [Event\<X\>](#eventx) — a CDP event subscription descriptor
5. [Connection](#connection) — low-level CDP websocket connection
6. [SeleniumCdpConnection](#seleniumcdpconnection) — factory that builds a `Connection` from a `WebDriver`/`Capabilities`
7. [NetworkInterceptor](#networkinterceptor) — HTTP-level request/response stubbing built on CDP
8. [CdpVersionFinder](#cdpversionfinder) — matches a browser version to a supported CDP version
9. [CdpInfo](#cdpinfo) — metadata + domain factory for one CDP version
10. [CdpEndpointFinder](#cdpendpointfinder) — resolves the CDP websocket endpoint URI
11. [Message](#message) / [Reply](#reply) — internal wire-format wrapper types
12. [ConverterFunctions](#converterfunctions) — helpers for building `Command`/`Event` JSON mappers
13. [DevToolsException](#devtoolsexception) / [RequestFailedException](#requestfailedexception) — exception types
14. [DevToolsProvider](#devtoolsprovider) — SPI glue for `RemoteWebDriver` augmentation (internal)

---

## DevTools

`public class DevTools extends Object implements Closeable`

The main entry point once you have a session. Obtained via `((HasDevTools) driver).getDevTools()`.
One `DevTools` wraps one `Connection` and (after `createSession()`) one CDP target session.

### DevTools Constructor

| Constructor                                                            | Notes                                                       |
| ---------------------------------------------------------------------- | ----------------------------------------------------------- |
| `DevTools(Function<DevTools,Domains> protocol, Connection connection)` | Normally not called directly — obtained from `HasDevTools`. |

### DevTools Methods

| Method                                                             | Description                                                                                                                                                                                     |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Domains getDomains()`                                             | Returns the version-specific `Domains` object (typed access to CDP domains like `Network`, `Performance`, `Browser`, generated per Chrome version, e.g. `org.openqa.selenium.devtools.v150.*`). |
| `void close()`                                                     | Closes the underlying connection. Implements `Closeable`/`AutoCloseable` — safe to use in try-with-resources.                                                                                   |
| `void disconnectSession()`                                         | Ends the CDP target session without closing the whole connection.                                                                                                                               |
| `<X> X send(Command<X> command)`                                   | Sends a CDP command and blocks for the typed response.                                                                                                                                          |
| `<X> X send(Command<X> command, Duration timeout)`                 | Same as above with an explicit timeout.                                                                                                                                                         |
| `<X> void addListener(Event<X> event, Consumer<X> handler)`        | Registers a handler invoked whenever `event` fires.                                                                                                                                             |
| `<X> void addListener(Event<X> event, BiConsumer<Long,X> handler)` | Same, but the handler also receives a monotonically increasing sequence number (gaps possible when other events interleave) — use when event ordering across types matters.                     |
| `void clearListeners()`                                            | Removes all registered listeners.                                                                                                                                                               |
| `void createSessionIfThereIsNotOne()`                              | Creates a session on the first "page" target only if one doesn't already exist.                                                                                                                 |
| `void createSessionIfThereIsNotOne(String windowHandle)`           | Same, targeting a specific window/tab.                                                                                                                                                          |
| `void createSession()`                                             | Creates a CDP session on the first available "page" target. **Required before sending most commands or attaching listeners.**                                                                   |
| `void createSession(String windowHandle)`                          | Creates a CDP session on a specific window/tab. Pass `driver.getWindowHandle()` when multiple tabs are open — otherwise the wrong tab may be attached.                                          |
| `SessionID getCdpSession()`                                        | Returns the current CDP session id, or `null` if none is active.                                                                                                                                |

---

## HasDevTools

`public interface HasDevTools`

Implemented by `ChromeDriver`, `ChromiumDriver`, `EdgeDriver`, `ElectronDriver`. Cast your `WebDriver`
to this interface to reach CDP.

### HasDevTools Methods

| Method                                  | Description                                                                                                                                                                              |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `default DevTools getDevTools()`        | Returns the `DevTools` instance for this driver session. Throws if CDP isn't supported/available.                                                                                        |
| `Optional<DevTools> maybeGetDevTools()` | Same, but returns `Optional.empty()` instead of throwing when CDP isn't available — safer for code paths that must also run against browsers without CDP support (e.g. Firefox, Safari). |

---

## Command\<X\>

`public class Command<X> extends Object`

Represents one CDP method invocation (`{"method": ..., "params": ...}`) plus a function that maps
the raw JSON response to a typed Java result `X`. You rarely construct these yourself — the
version-specific domain classes (`Network`, `Page`, `Performance`, `Browser`, ... under
`org.openqa.selenium.devtools.v<NNN>.*`) expose static factory methods that return pre-built
`Command<X>` objects, e.g. `Network.setCookie(...)`, `Performance.getMetrics()`.

### Command Constructors

| Constructor                                                                       | Notes                                                                           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| `Command(String method, Map<String,Object> params)`                               | Untyped — response type is `Void`/raw map.                                      |
| `Command(String method, Map<String,Object> params, Type typeOfX)`                 | Response deserialized to `typeOfX` via reflection.                              |
| `Command(String method, Map<String,Object> params, Function<JsonInput,X> mapper)` | Response deserialized with a custom mapper function — see `ConverterFunctions`. |

### Command Methods

| Method                             | Description                                                                       |
| ---------------------------------- | --------------------------------------------------------------------------------- |
| `String getMethod()`               | The CDP method name, e.g. `"Network.setCookie"`.                                  |
| `Map<String,Object> getParams()`   | The parameter map that will be sent.                                              |
| `boolean getSendsResponse()`       | Whether the caller should wait for a reply.                                       |
| `Command<X> doesNotSendResponse()` | **Deprecated** — no longer needed; all CDP commands return at least an empty map. |

---

## Event\<X\>

`public class Event<X> extends Object`

Describes a CDP event subscription: an event name plus a function that maps the raw JSON payload
to a typed Java object `X`. Pass these to `DevTools.addListener(...)`. Like `Command`, these are
normally obtained from generated domain classes, e.g. `Network.responseReceived()`,
`Browser.downloadProgress()`, or from `org.openqa.selenium.devtools.events.CdpEventTypes`
(`consoleEvent(...)`, `domMutation(...)`, `javascriptException(...)`) for the higher-level,
version-independent events.

### Event Constructor

| Constructor                                          | Notes |
| ---------------------------------------------------- | ----- |
| `Event(String method, Function<JsonInput,X> mapper)` |       |

### Event Methods

| Method               | Description         |
| -------------------- | ------------------- |
| `String getMethod()` | The CDP event name. |
| `String toString()`  |                     |

---

## Connection

`public class Connection extends Object implements Closeable`

The low-level CDP websocket transport. `DevTools` is built on top of one `Connection`. Direct use
is only needed for advanced scenarios (custom session multiplexing, non-Selenium-managed CDP
endpoints); most code should go through `DevTools` via `HasDevTools`.

### Connection Constructors

| Constructor                                                            | Notes                                             |
| ---------------------------------------------------------------------- | ------------------------------------------------- |
| `Connection(HttpClient client, String url)`                            | **Deprecated** — use the `ClientConfig` overload. |
| `Connection(HttpClient client, String url, ClientConfig clientConfig)` |                                                   |

### Connection Methods

| Method                                                                         | Description                                                                             |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| `<X> CompletableFuture<X> send(SessionID sessionId, Command<X> command)`       | Sends a command asynchronously; `sessionId` may be `null` for the browser-level target. |
| `<X> X sendAndWait(SessionID sessionId, Command<X> command, Duration timeout)` | Blocking variant with an explicit timeout.                                              |
| `<X> void addListener(Event<X> event, BiConsumer<Long,X> handler)`             | Registers a raw event listener at the connection level.                                 |
| `void clearListeners()`                                                        |                                                                                         |
| `void close()`                                                                 |                                                                                         |

---

## SeleniumCdpConnection

`public class SeleniumCdpConnection extends Connection`

Static factory for building a `Connection` that talks to the CDP endpoint Selenium already knows
about (extracted from driver capabilities), instead of hand-rolling a websocket URL.

### SeleniumCdpConnection Methods

| Method                                                                                                                       | Description                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `static Optional<Connection> create(WebDriver driver)`                                                                       | **Deprecated** — use the `ClientConfig` overload.                                                                             |
| `static Optional<Connection> create(WebDriver driver, ClientConfig clientConfig)`                                            | Builds a connection from a live driver session.                                                                               |
| `static Optional<Connection> create(Capabilities capabilities)`                                                              | **Deprecated** — use the `ClientConfig` overload.                                                                             |
| `static Optional<Connection> create(Capabilities capabilities, ClientConfig clientConfig)`                                   | Builds a connection directly from capabilities (e.g. when working with a `RemoteWebDriver` session that isn't `HasDevTools`). |
| `static Optional<Connection> create(HttpClient.Factory clientFactory, Capabilities capabilities)`                            | **Deprecated**.                                                                                                               |
| `static Optional<Connection> create(HttpClient.Factory clientFactory, Capabilities capabilities, ClientConfig clientConfig)` | Full control over the `HttpClient.Factory` used for the websocket.                                                            |

Plus all inherited `Connection` methods (`send`, `sendAndWait`, `addListener`, `clearListeners`, `close`).

---

## NetworkInterceptor

`public class NetworkInterceptor extends Object implements AutoCloseable`

The recommended, higher-level way to stub, record, or transform HTTP traffic — built on CDP's
`Fetch`/`Network` domains but exposed as a plain `org.openqa.selenium.remote.http.Filter` /
`Routable` chain, so you don't write raw CDP request-interception code. See `SKILL.md` for
worked examples (stub a response, record responses, rewrite a request URL).

### NetworkInterceptor Field

| Field                                            | Description                                                                       |
| ------------------------------------------------ | --------------------------------------------------------------------------------- |
| `static final HttpResponse PROCEED_WITH_REQUEST` | Return this from a `Routable` to let the browser continue the request unmodified. |

### NetworkInterceptor Constructors

| Constructor                                                 | When to use                                                                                                                                              |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `NetworkInterceptor(WebDriver driver, HttpHandler handler)` | You want full control — receive an `HttpRequest`, return an `HttpResponse` yourself.                                                                     |
| `NetworkInterceptor(WebDriver driver, Routable routable)`   | You want to match specific requests with `Route.matching(...)` and stub/redirect only those; everything else proceeds untouched.                         |
| `NetworkInterceptor(WebDriver driver, Filter filter)`       | You want to wrap the real network call — inspect/record the response, or rewrite the request before it goes out, while still letting it hit the network. |

### NetworkInterceptor Methods

| Method                                                                                                                         | Description                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `void close()`                                                                                                                 | Stops intercepting and detaches from the driver. Always use try-with-resources or an explicit `close()` — interception stays active on the session until closed. |
| `protected HttpMethod convertFromCdpHttpMethod(String method)`                                                                 | Internal helper converting a CDP method string to Selenium's `HttpMethod` enum.                                                                                  |
| `protected HttpRequest createHttpRequest(String cdpMethod, String url, Map<String,Object> headers, Optional<String> postData)` | Internal helper building an `HttpRequest` from raw CDP `Fetch.requestPaused` fields.                                                                             |

---

## CdpVersionFinder

`public class CdpVersionFinder extends Object`

Matches a browser's reported version string to the closest CDP version Selenium has generated
bindings for. Selenium supports the 3 most recent Chrome versions at any time; this class is how
the driver picks the right `org.openqa.selenium.devtools.v<NNN>` package automatically. You
normally never call this directly — it's used internally when `HasDevTools.getDevTools()` wires
up `getDomains()` — but it's useful if you need to detect/assert the resolved CDP version yourself.

### CdpVersionFinder Constructors

| Constructor                                                           | Notes                                                         |
| --------------------------------------------------------------------- | ------------------------------------------------------------- |
| `CdpVersionFinder()`                                                  | Uses the built-in registry of known `CdpInfo` versions.       |
| `CdpVersionFinder(int versionFudgeFactor, Collection<CdpInfo> infos)` | Custom tolerance and custom version set — mainly for testing. |

### CdpVersionFinder Methods

| Method                                                    | Description                                                                                                                  |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `Optional<CdpInfo> match(Map<String,Object> versionJson)` | Matches against the parsed output of a CDP endpoint's `/json/version`.                                                       |
| `CdpInfo findMatchingVersion(String browserVersion)`      | Matches a `Capabilities`-style browser version string. Returns `NoOpCdpInfo` (never null) if nothing matches closely enough. |
| `Optional<CdpInfo> match(String browserVersion)`          | Same matching logic as `findMatchingVersion`, but returns `Optional.empty()` instead of a no-op object when nothing matches. |

---

## CdpInfo

`public abstract class CdpInfo extends Object implements Comparable<CdpInfo>`

Describes one supported CDP version: its major version number and a factory for the `Domains`
implementation of that version. Each generated `org.openqa.selenium.devtools.v<NNN>` package
contributes one `CdpInfo`. Subclassed by `NoOpCdpInfo` (fallback when no real match is found).

### CdpInfo Constructor

| Constructor                                                               | Notes                                                      |
| ------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `protected CdpInfo(int majorVersion, Function<DevTools,Domains> domains)` | Called by generated per-version subclasses, not user code. |

### CdpInfo Methods

| Method                                  | Description                                                                         |
| --------------------------------------- | ----------------------------------------------------------------------------------- |
| `int getMajorVersion()`                 |                                                                                     |
| `Domains getDomains(DevTools devTools)` | Builds the typed `Domains` object for this CDP version, bound to the given session. |
| `int compareTo(CdpInfo that)`           | Orders by major version.                                                            |
| `String toString()`                     |                                                                                     |

---

## CdpEndpointFinder

`public class CdpEndpointFinder extends Object`

Resolves the actual CDP websocket endpoint URI, either from a live `HttpClient` talking to the
browser's debug port, or from driver `Capabilities`. Used internally by `SeleniumCdpConnection`;
call directly only if you're building a custom connection outside the normal `HasDevTools` flow.

### CdpEndpointFinder Methods

## Message

`public class Message extends Object`

Internal wire-format wrapper type for the raw CDP JSON protocol (`{"id": ..., "result": ...}`).
You will not construct or consume this directly in normal usage — it exists to support
(de)serialization inside `Connection`.

### Message Constructor & Methods

| Constructor / Method              | Notes |
| --------------------------------- | ----- |
| `Message(long id, Object result)` |       |
| `String toString()`               |       |

---

## Reply

`public class Reply extends Object`

Internal wire-format wrapper type for reply payloads inside `Connection`.

### Reply Constructor

| Constructor | Notes                                                                                 |
| ----------- | ------------------------------------------------------------------------------------- |
| `Reply()`   | No additional public methods beyond `Object` — a marker/base type for reply payloads. |

---

## ConverterFunctions

`public class ConverterFunctions extends Object`

Static helpers for building the `Function<JsonInput, X>` mappers used by `Command` and `Event`
constructors when you need to hand-write a command/event instead of using a generated domain
class (rare — mainly for calling brand-new/undocumented CDP methods ahead of Selenium's codegen).

### ConverterFunctions Methods

| Method                                                                             | Description                                                                               |
| ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `static <X> Function<JsonInput,X> map(String keyName, Type typeOfX)`               | Reads one named field out of the JSON response and reflectively converts it to `typeOfX`. |
| `static <X> Function<JsonInput,X> map(String keyName, Function<JsonInput,X> read)` | Reads one named field and applies a custom conversion function.                           |
| `static Function<JsonInput,Void> empty()`                                          | Mapper for commands whose response body can be ignored entirely.                          |

---

## DevToolsException

`public class DevToolsException extends WebDriverException`

General-purpose CDP failure (bad response, protocol mismatch, timeout).

### DevToolsException Constructors

| Constructor                                                    |
| -------------------------------------------------------------- |
| `DevToolsException(Throwable cause)`                           |
| `DevToolsException(String message)`                            |
| `DevToolsException(String message, @Nullable Throwable cause)` |

---

## RequestFailedException

`public class RequestFailedException extends WebDriverException`

Thrown by the terminal `HttpHandler` in a `Filter` chain (see `NetworkInterceptor`) when the
browser fails to send an HTTP request. Catch this inside your `Filter` to return a custom
fallback response instead of propagating the failure.

### RequestFailedException Constructor

| Constructor                |
| -------------------------- |
| `RequestFailedException()` |

---

## DevToolsProvider

`public class DevToolsProvider extends Object implements AugmenterProvider<HasDevTools>`

Internal SPI (`@AutoService(AugmenterProvider.class)`) that lets `RemoteWebDriver` sessions get
augmented with `HasDevTools` support automatically when talking to a Grid/remote endpoint that
reports CDP capability. Not intended to be called directly from test code.

| Method                                                                          | Description                                                   |
| ------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `Predicate<Capabilities> isApplicable()`                                        | Whether this provider should activate for given capabilities. |
| `Class<HasDevTools> getDescribedInterface()`                                    | The interface this provider augments onto the driver.         |
| `HasDevTools getImplementation(Capabilities caps, ExecuteMethod executeMethod)` | Builds the `HasDevTools` implementation.                      |
