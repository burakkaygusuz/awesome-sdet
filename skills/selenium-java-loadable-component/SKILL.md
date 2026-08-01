---
name: selenium-java-loadable-component
description: Use for Java Selenium Page Objects needing a standard load/verify lifecycle — the LoadableComponent pattern (`org.openqa.selenium.support.ui.LoadableComponent`). Trigger on mentions of LoadableComponent, SlowLoadableComponent, `load()`/`isLoaded()`/`get()` page-object methods, chaining page-object preconditions (e.g. login-then-navigate), nested/parent page objects, or waiting for a page to finish loading before assertions run. Also use to explain, implement, or refactor a Page Object into this pattern, or for the full method list of `LoadableComponent`/`SlowLoadableComponent`.
metadata:
  keywords: ['selenium', 'java', 'loadable-component', 'testing']
---

# LoadableComponent Design Pattern — Selenium Java

## Source & scope

Condensed from the current Selenium documentation
(`selenium.dev/documentation/test_practices/design_strategies/`, "Loadable Component" section)
and the Javadoc for `org.openqa.selenium.support.ui.LoadableComponent` /
`SlowLoadableComponent`. This supersedes the older GitHub wiki page
(`github.com/SeleniumHQ/selenium/wiki/LoadableComponent`), which documents the Selenium 2 /
JUnit 3 era API — that page has been folded into the design-strategies doc above. The examples
below use the current Selenium 4 package (`org.openqa.selenium.support.ui.LoadableComponent`)
and JUnit 5 (`org.junit.jupiter.api.Assertions`); if a codebase still uses the older
`junit.framework.Assert`/`org.junit.Assert` imports, only the assertion import changes — the
pattern itself is identical.

## What it is / problem it solves

`LoadableComponent<T>` is an abstract base class for a Page Object (or any "component" — a full
page, a login modal, even a backend service) that standardizes three things: how to trigger
loading (`load()`), how to verify it actually loaded (`isLoaded()`), and a single `get()` entry
point that ties the two together — checking first, and only navigating if not already there. This
removes repetitive "am I already here? do I need to navigate?" boilerplate from every Page Object
and gives one place to add clear failure diagnostics when a page fails to load.

## When to use it

- A Page Object needs a precondition (specific URL, logged-in state, a prior page) satisfied before it's usable.
- The same page/component is reached from multiple starting points in different tests, and navigation should be idempotent — skip re-navigating if a previous step already put you there.
- Multi-step preconditions (must be logged in **and** on the right project **and** on the right sub-page) need composing — model each as its own `LoadableComponent` and chain them (see Recipe 2).
- A page/route finishes rendering asynchronously after `load()` returns — use the `SlowLoadableComponent` subclass (Recipe 3) instead of adding ad-hoc waits inside `load()`.

## When NOT to use it

- Simple pages a test always reaches by an explicit, unconditional `driver.get(url)` — the "skip navigation if already loaded" behavior of `get()` adds nothing, and the assertion/retry machinery is pure overhead.
- A component with no meaningful "am I loaded" check to assert against — just construct it and use an explicit wait where needed; wrapping it in `LoadableComponent` for its own sake is unnecessary ceremony.

## Core API

`org.openqa.selenium.support.ui.LoadableComponent<T extends LoadableComponent<T>>` — abstract.

| Member                                            | Description                                                                                                                                                                                                                                                                    |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `LoadableComponent()`                             | No-arg constructor.                                                                                                                                                                                                                                                            |
| `T get()`                                         | **The only method test code calls.** Calls `isLoaded()`; if it throws `Error`, calls `load()`, then calls `isLoaded()` once more — uncaught this time, so a second failure propagates out of `get()`. Returns `this` cast to `T`, so it chains: `new EditIssue(driver).get()`. |
| `protected abstract void load()`                  | Implement: perform the navigation/action needed to reach the component (`driver.get(url)`, or `parent.get()` plus navigation for nested components). Must be side-effect-only — do not assert success here.                                                                    |
| `protected abstract void isLoaded() throws Error` | Implement: assert the component is currently loaded. Return normally if loaded; **throw `Error`** if not (use `org.junit.jupiter.api.Assertions.assertTrue/assertFalse/fail`, which throw `AssertionError`, a subclass of `Error`).                                            |

`org.openqa.selenium.support.ui.SlowLoadableComponent<T extends LoadableComponent<T>>` —
abstract, extends `LoadableComponent<T>`. Use when `load()` returns before the component has
actually finished loading (an async route, a spinner-then-render page) and `isLoaded()` needs to
be polled until it passes or a timeout elapses, instead of checked exactly once.

| Member                                                 | Description                                                                                                                                                                                                                               |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `SlowLoadableComponent(Clock clock, Duration timeOut)` | Pass `Clock.systemDefaultZone()` and how long to keep polling before giving up.                                                                                                                                                           |
| `T get()`                                              | Overrides the base `get()`: after `load()`, repeatedly polls `isLoaded()` (sleeping `sleepFor()` between attempts) until it passes or `timeOut` elapses, then calls `isError()` before failing.                                           |
| `protected void isError() throws Error`                | Optional hook: check for a well-known _error_ state (e.g. a visible "not found" banner) meaning loading finished but failed — lets you fail fast with a specific message instead of a generic timeout. Default implementation is a no-op. |
| `protected long sleepFor()`                            | Returns the poll interval in ms between `isLoaded()` retries; override to change the default cadence.                                                                                                                                     |
| _(inherited)_ `load()`, `isLoaded()`                   | Same contract as `LoadableComponent` — implement these; do not override `get()`.                                                                                                                                                          |

## Recipe 1 — Basic component

Use when a Page Object has one clear "am I on the right page" check.

```java
import org.openqa.selenium.support.ui.LoadableComponent;
import org.junit.jupiter.api.Assertions;

public class EditIssue extends LoadableComponent<EditIssue> {

  private final WebDriver driver;

  public EditIssue(WebDriver driver) {
    this.driver = driver;
  }

  @Override
  protected void load() {
    driver.get("https://github.com/SeleniumHQ/selenium/issues/new");
  }

  @Override
  protected void isLoaded() throws Error {
    String url = driver.getCurrentUrl();
    Assertions.assertTrue(url.contains("/issues/new"), "Not on the issue entry page: " + url);
  }
}
```

Test code never calls `load()`/`isLoaded()` directly — always go through `get()`:

```java
EditIssue page = new EditIssue(driver).get();
```

`get()` checks `isLoaded()` first; if it already passes (e.g. a previous step already put you on
this page), it returns immediately with no navigation. Only on failure does it call `load()`.

## Recipe 2 — Nested components (chained preconditions)

Use when reaching a component requires satisfying one or more parent preconditions first (login,
being on the right sub-site, etc.) — model each precondition as its own `LoadableComponent` and
chain them by calling `parent.get()` inside `load()`.

```java
public class SecuredPage extends LoadableComponent<SecuredPage> {
  private final WebDriver driver;
  private final LoadableComponent<?> parent;
  private final String username, password;

  public SecuredPage(WebDriver driver, LoadableComponent<?> parent, String username, String password) {
    this.driver = driver;
    this.parent = parent;
    this.username = username;
    this.password = password;
  }

  @Override
  protected void load() {
    parent.get();                        // satisfy the parent precondition first
    String originalUrl = driver.getCurrentUrl();
    driver.get("https://example.com/login");
    driver.findElement(By.name("Email")).sendKeys(username);
    WebElement pwd = driver.findElement(By.name("Passwd"));
    pwd.sendKeys(password);
    pwd.submit();
    driver.get(originalUrl);             // return to where the caller was headed
  }

  @Override
  protected void isLoaded() throws Error {
    if (driver.findElements(By.id("account-menu")).isEmpty()) {
      Assertions.fail("Not signed in");
    }
  }
}

public class EditIssue extends LoadableComponent<EditIssue> {
  private final WebDriver driver;
  private final LoadableComponent<?> parent;   // null when there's no precondition

  public EditIssue(WebDriver driver, LoadableComponent<?> parent) {
    this.driver = driver;
    this.parent = parent;
  }

  @Override
  protected void load() {
    if (parent != null) {
      parent.get();                      // triggers the whole precondition chain
    }
    driver.get("https://github.com/SeleniumHQ/selenium/issues/new");
  }

  @Override
  protected void isLoaded() throws Error {
    Assertions.assertTrue(driver.getCurrentUrl().contains("/issues/new"));
  }
}
```

```java
ProjectPage project = new ProjectPage(driver, "selenium");
SecuredPage securedPage = new SecuredPage(driver, project, "user", "pw");
EditIssue editIssue = new EditIssue(driver, securedPage).get();
// One call walks the whole chain — logs in (if needed), lands on the project (if needed),
// then opens the issue form — doing only the steps not already satisfied.
```

## Recipe 3 — Slow / asynchronously loading components

Use `SlowLoadableComponent` instead of `LoadableComponent` when `load()` returning doesn't mean
the component is actually ready (an SPA route that renders after an XHR, a page behind a loading
spinner). `get()` will keep retrying `isLoaded()` until it passes or the timeout expires, instead
of checking exactly once and failing.

```java
import org.openqa.selenium.support.ui.SlowLoadableComponent;
import java.time.Clock;
import java.time.Duration;

public class SearchResultsPage extends SlowLoadableComponent<SearchResultsPage> {
  private final WebDriver driver;

  public SearchResultsPage(WebDriver driver) {
    super(Clock.systemDefaultZone(), Duration.ofSeconds(10));   // poll for up to 10s
    this.driver = driver;
  }

  @Override
  protected void load() {
    driver.findElement(By.id("search-button")).click();        // triggers an async XHR
  }

  @Override
  protected void isLoaded() throws Error {
    Assertions.assertFalse(
        driver.findElements(By.cssSelector(".result-item")).isEmpty(),
        "Results have not rendered yet");
  }

  @Override
  protected void isError() throws Error {
    Assertions.assertTrue(
        driver.findElements(By.cssSelector(".error-banner")).isEmpty(),
        "Search failed with a visible error banner");
  }
}
```

```java
SearchResultsPage results = new SearchResultsPage(driver).get();
// Blocks (polling isLoaded() every sleepFor() ms) until results render, or throws after 10s.
```

`isError()` runs once polling is about to give up — use it to surface a specific, known failure
message (e.g. "search failed") instead of a generic timeout when the failure mode is detectable.

## Gotchas

- `isLoaded()` **must** signal failure by throwing `Error`. Use `org.junit.jupiter.api.Assertions`
  methods (`assertTrue`, `assertFalse`, `fail`, ...) — they throw `AssertionError`, a subclass of
  `Error`. Throwing a plain `RuntimeException`, or returning a `boolean` from your own method
  instead of throwing, will **not** be caught by `get()`'s retry logic — it just propagates and
  `load()` never runs.
- Plain `LoadableComponent.get()` retries **exactly once**: `isLoaded()` → (on failure) `load()` →
  `isLoaded()` again, uncaught. Only `SlowLoadableComponent` polls repeatedly.
- Keep `load()` side-effect-only (navigate/click/submit) and keep all assertions inside
  `isLoaded()`. Putting verification in `load()` defeats the check-then-load-then-check contract
  `get()` relies on.
- In nested components, call `parent.get()` inside `load()`, not in the constructor — it must run
  only when the child actually needs to (re)load, not on every object construction.
- `SlowLoadableComponent`'s polling is a plain sleep loop (`sleepFor()`), independent of
  `WebDriverWait`/`FluentWait`/`ExpectedConditions` — Selenium's explicit-wait configuration has
  no effect on it; tune `sleepFor()` and the constructor `timeOut` directly instead.
