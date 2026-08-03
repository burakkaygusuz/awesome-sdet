---
name: selenium-java-pagefactory-pom
description: Use for Java Selenium Page Object Model (POM) and PageFactory work — organizing locators/actions into page classes, `@FindBy`/`@FindBys`/`@FindAll`/`@CacheLookup` annotations, `PageFactory.initElements`, `AjaxElementLocatorFactory` for implicit per-element waits, or a custom `ElementLocatorFactory`/`FieldDecorator`. Trigger on mentions of PageFactory, Page Object Model, POM, @FindBy, @FindBys, @FindAll, @CacheLookup, the How enum, ElementLocator, ElementLocatorFactory, FieldDecorator, ByAll, ByChained, or building/reviewing Selenium page classes.
metadata:
  keywords: ['selenium', 'java', 'pagefactory', 'pom', 'testing']
---

# PageFactory & Page Object Model — Selenium Java

## Source & scope

Condensed from the Selenium wiki's PageFactory page (now folded into
the `.../support/pagefactory/package-summary.html` sibling page). Read this file for everyday
recipes and the reasoning for picking one approach over another; complete class, annotation,
and method listings are served dynamically by the `sdet-mcp` server
(`read_pagefactory_docs` tool) — query it for an exact signature or a class not covered here.

## POM vs PageFactory — two separate things

**Page Object Model (POM)** is the _design pattern_: one class per page/component, holding its
locators and the actions available on it, kept separate from test/assertion logic. **PageFactory**
is Selenium's _optional helper_ for implementing POM — a reflection-based factory that reads
`@FindBy`-style annotations and injects lazy `WebElement` proxies, so you don't hand-write
`driver.findElement(...)` for every field. You can do POM without PageFactory (Recipe 1) or POM
with PageFactory (Recipe 2+); PageFactory without POM (annotated fields scattered outside any
page-class structure) is technically possible but defeats the point.

## When to use PageFactory specifically

- Page classes have several elements and you want to declare them once as fields instead of
  repeating `driver.findElement(By...)` in every method.
- You want elements looked up lazily (only on first actual use) rather than at construction time.
- You want a single annotation (`@FindBy`) to carry the locator instead of a `By` constant plus a
  `findElement` call at every use site.

## When NOT to use it

- Very small scripts/spikes where a couple of `By` constants are simpler than annotation setup.
- Teams that have been bitten by proxy-caching subtleties (see Gotchas) and prefer the explicitness
  of manual `driver.findElement` calls — a plain POM class (Recipe 1) is equally valid Selenium
  usage and some codebases standardize on it instead of PageFactory.
- Elements that must be explicitly waited-and-asserted-on with custom conditions per access —
  `ExpectedConditions`/`WebDriverWait` in the action method is often clearer than tuning locator
  factories for one special element.

## Core API — quick map

| Type                                       | Role                                                                                                       |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `PageFactory`                              | Static entry point: `initElements(driver, this)` or one of its overloads.                                  |
| `@FindBy`                                  | Per-field locator: `@FindBy(id = "...")`, `css = "..."`, `xpath = "..."`, etc.                             |
| `@FindBys`                                 | Chains several `@FindBy` tags — each searches _within_ the previous match (AND/nested).                    |
| `@FindAll`                                 | Matches _any_ of several `@FindBy` tags (OR).                                                              |
| `@CacheLookup`                             | Marks a field to be looked up once and reused — only for elements that never leave the DOM.                |
| `How` (+ `how`/`using` on `@FindBy`)       | Legacy strategy selector; superseded by `@FindBy`'s named attributes except for `ID_OR_NAME`.              |
| `ElementLocatorFactory` (`Default`/`Ajax`) | Controls _how_ each field is located — swap in `AjaxElementLocatorFactory` for implicit per-element waits. |
| `FieldDecorator` (`Default`)               | Controls _what_ gets injected into each field — full customization point.                                  |

## Recipe 1 — Plain POM, no PageFactory (baseline)

Use when you want the simplest, most explicit code — no proxies, no annotation magic, `By`
constants are compiler-checked and greppable.

```java
package com.example.pages;

import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;

public class HomePage {

  private final WebDriver driver;
  private final By header = By.xpath("//h1");
  private final By getStarted = By.xpath("//*[@id='signupModalButton']");

  public HomePage(WebDriver driver) {
    this.driver = driver;
  }

  public String getHeaderText() {
    return driver.findElement(header).getText();
  }

  public void clickGetStarted() {
    driver.findElement(getStarted).click();
  }
}
```

Every action method re-locates the element via `driver.findElement(...)` — no caching, no
staleness surprises, easy to reason about.

## Recipe 2 — PageFactory with `@FindBy` (the common case)

Use once a page has enough fields that repeating `driver.findElement` everywhere gets noisy.
Call `PageFactory.initElements(driver, this)` in the constructor; fields become lazy proxies.

```java
package com.example.pages;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;

public class LoginPage {

  @FindBy(id = "username") private WebElement user;
  @FindBy(id = "password") private WebElement pass;
  @FindBy(id = "loginBtn") private WebElement login;

  public LoginPage(WebDriver driver) {
    PageFactory.initElements(driver, this);
  }

  public void login(String username, String password) {
    user.sendKeys(username);
    pass.sendKeys(password);
    login.click();
  }
}
```

If a field has no `@FindBy` at all, PageFactory falls back to the field name as the element's
`id` or `name` (e.g. a bare `private WebElement q;` looks up `id="q"` or `name="q"`) — this is
how the original Selenium wiki's minimal Google-search example works, but naming fields to match
production HTML attributes is fragile; prefer an explicit `@FindBy` in real code.

## Recipe 3 — `@CacheLookup` for elements that never change

Use only for elements you're certain stay as the _same DOM node_ for the page's lifetime (a
static header, a nav link) — never for anything an AJAX call or framework re-render could replace.

```java
public class GoogleSearchPage {

  @FindBy(name = "q")
  @CacheLookup
  private WebElement searchBox;

  public void searchFor(String text) {
    searchBox.sendKeys(text);
    searchBox.submit();
  }
}
```

Without `@CacheLookup`, PageFactory re-runs `findElement` on every method call on that field —
correct for AJAX-heavy pages, slightly wasteful for elements that are provably static.

## Recipe 4 — Combining locators: `@FindBys` (AND) vs `@FindAll` (OR)

Use `@FindBys` when one locator should narrow the search inside another (nested structure); use
`@FindAll` when the _same logical element_ might be findable by either of two different locators
(e.g. an A/B-tested page variant, or a migration where the `id` changed but old pages still use
the old one).

```java
// AND / nested: element must match XPath AND be findable by id within that context
@FindBys({
    @FindBy(xpath = "//div[@class='footer']"),
    @FindBy(id = "submit")
})
private WebElement submitButton;

// OR / either-locator: matches whichever of the two locators finds something
@FindAll({
    @FindBy(id = "staySignedIn"),
    @FindBy(name = "remember_me")
})
private WebElement staySignedIn;
```

## Recipe 5 — `AjaxElementLocatorFactory` for implicit per-element waits

Use when elements on a page render asynchronously after `initElements` runs, and you'd otherwise
need to wrap every access in `WebDriverWait` — this bakes a poll-and-retry into the field lookup
itself so ordinary field access (`element.click()`) just works once the element appears.

```java
import org.openqa.selenium.support.pagefactory.AjaxElementLocatorFactory;

public class SearchResultsPage {

  @FindBy(className = "result-item")
  private List<WebElement> results;

  public SearchResultsPage(WebDriver driver) {
    // waits up to 10s per field lookup instead of failing instantly
    PageFactory.initElements(new AjaxElementLocatorFactory(driver, 10), this);
  }

  public int resultCount() {
    return results.size();
  }
}
```

Avoid XPath locators on fields decorated this way — `AjaxElementLocator` polls the interface
repeatedly, and XPath re-evaluation on every poll is comparatively expensive.

## Recipe 6 — Custom `ElementLocatorFactory` (advanced)

Use when neither the default (no-wait) nor Ajax (fixed-timeout-poll) locator behavior fits — e.g.
you want a custom retry policy, logging on every lookup, or to pierce a shadow DOM boundary.
Implement `ElementLocatorFactory`/`ElementLocator` and hand it to `PageFactory.initElements`
directly instead of the `(driver, this)` shorthand:

```java
ElementLocatorFactory customFactory = field -> new ElementLocator() {
  @Override public WebElement findElement() {
    // custom lookup / retry / logging logic, then delegate:
    return driver.findElement(new Annotations(field).buildBy());
  }
  @Override public List<WebElement> findElements() {
    return driver.findElements(new Annotations(field).buildBy());
  }
};

PageFactory.initElements(customFactory, this);
```

`Annotations(field).buildBy()` reuses PageFactory's own `@FindBy`/`@FindBys`/`@FindAll` parsing so
you don't have to reimplement it — use the `read_pagefactory_docs` tool to see the
`Annotations` class reference.

## `initElements` overload cheat sheet

| Call                                                                    | Use when                                                                                                                                                                                         |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `initElements(driver, MyPage.class)`                                    | You want PageFactory to construct the page object too (needs a `(WebDriver)` or no-arg constructor).                                                                                             |
| `initElements(driver, this)`                                            | Standard case — inside the page class's own constructor, after other fields are set.                                                                                                             |
| `initElements(new AjaxElementLocatorFactory(driver, timeoutSec), this)` | Swap in implicit per-element waiting (Recipe 5).                                                                                                                                                 |
| `initElements(customFieldDecorator, this)`                              | Full control over what gets injected per field (Recipe 6, one level deeper — implement `FieldDecorator` instead of `ElementLocatorFactory` if you need to decorate non-`WebElement` fields too). |

## Gotchas

- **Lazy, not eager**: fields are only actually looked up the first time a method is called on
  them — a typo'd locator won't throw at `initElements()` time, only on first use. Don't assume a
  clean `initElements()` call means every locator is valid.
- **Never assume a concrete `WebElement` subclass**: PageFactory injects dynamic proxies, not
  driver-specific implementations (e.g. not literally an `HtmlUnitWebElement` even when using
  `HtmlUnitDriver`). Don't cast fields to implementation types.
- **`List<WebElement>` fields need an explicit annotation**: the field-name-as-id-or-name default
  only applies to single `WebElement` fields; an unannotated `List<WebElement>` field is left
  completely undecorated (stays `null`) because "several elements sharing one id/name" is rarely
  meaningful. Always put `@FindBy`/`@FindBys`/`@FindAll` on list fields.
- **`@CacheLookup` + a DOM node that gets replaced → `StaleElementReferenceException`**: the cache
  stores the resolved `WebElement` reference, not the locator, so if the underlying DOM node is
  swapped out (common with client-side re-renders) every further call throws stale-reference
  errors instead of silently re-locating.
- **Constructor selection**: `PageFactory.initElements(SearchContext, Class<T>)` prefers a
  `(WebDriver)` constructor and falls back to no-arg; if your page class needs other constructor
  args (a parent page, config, etc.), use `initElements(SearchContext, Object)` on an
  already-constructed instance instead (see Recipe 2's pattern, which every recipe above uses).
- **`how`/`using` is rarely needed now**: `@FindBy` exposes `id`, `name`, `className`, `css`,
  `tagName`, `linkText`, `partialLinkText`, `xpath` directly — reach for `how = How.ID_OR_NAME,
using = "..."` only for the one strategy with no dedicated attribute.

## Dynamic MCP Support & Reference (Optional)

This skill is fully self-contained. If the `sdet-mcp` server is available in your workspace, you can dynamically query multi-language Page Object Model code references and PageFactory class specifications via the `read_se_pagefactory_docs` tool.
