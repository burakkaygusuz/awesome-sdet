# API Reference — org.openqa.selenium.support & org.openqa.selenium.support.pagefactory

## org.openqa.selenium.support

### PageFactory

```java
public class PageFactory — all members static; never instantiated directly.

initElements(SearchContext, Class<T>)  → Instantiates pageClassToProxy (prefers WebDriver constructor, falls back to no-arg) and decorates every WebElement/List<WebElement> field with a lazy proxy using the field name as id/name unless @FindBy overrides it.
initElements(SearchContext, Object)    → Decorates an already-constructed page object; use when the constructor needs args PageFactory cannot guess.
initElements(ElementLocatorFactory, Object) → Swaps in a custom factory (e.g. AjaxElementLocatorFactory).
initElements(FieldDecorator, Object)   → Full control — supply a custom FieldDecorator per field.
```

### @FindBy

```java
@Retention(RUNTIME) @Target({FIELD,TYPE})
// Elements: how(How, default UNSET), using(String), id, name, className, css, tagName, linkText, partialLinkText, xpath.
@FindBy(id="foo") // Equivalent to @FindBy(how=How.ID, using="foo"). Named attributes preferred; how/using only needed for ID_OR_NAME.
```

### @FindBys

```java
@Retention(RUNTIME) @Target({FIELD,TYPE})
// Element: value(FindBy[], required) — chains into ByChained (AND/nested semantics).
@FindBys({@FindBy(id="foo"), @FindBy(className="bar")})
```

### @FindAll

```java
@Retention(RUNTIME) @Target({FIELD,TYPE})
// Element: value(FindBy[], required) — backs ByAll (OR semantics; order not guaranteed).
@FindAll({@FindBy(id="foo"), @FindBy(className="bar")})
```

### @CacheLookup

```java
@Retention(RUNTIME) @Target(FIELD)
// Marker annotation — instructs PageFactory to look up the DOM node once and cache the reference.
// Never use on elements that can be replaced by JS/AJAX re-renders (→ StaleElementReferenceException).
```

### How

```java
public enum How {
  CLASS_NAME, CSS, ID, LINK_TEXT, NAME, PARTIAL_LINK_TEXT, TAG_NAME, XPATH, ID_OR_NAME, UNSET;
  public abstract By buildBy(String value);
}
```

### ByIdOrName

```java
public class ByIdOrName extends By {
  public ByIdOrName(String idOrName);
  public WebElement findElement(SearchContext context);
  public List<WebElement> findElements(SearchContext context);
}
```

## org.openqa.selenium.support.pagefactory

### ElementLocator

```java
public interface ElementLocator {
  WebElement findElement();
  List<WebElement> findElements();
}
```

### ElementLocatorFactory

```java
public interface ElementLocatorFactory {
  ElementLocator createLocator(Field field);
}
```

### DefaultElementLocator

```java
public class DefaultElementLocator implements ElementLocator {
  public DefaultElementLocator(SearchContext searchContext, Field field);
  public DefaultElementLocator(SearchContext searchContext, AbstractAnnotations annotations);
  public WebElement findElement();
  public List<WebElement> findElements();
  protected boolean shouldCache();
}
```

### DefaultElementLocatorFactory

```java
public final class DefaultElementLocatorFactory implements ElementLocatorFactory {
  public DefaultElementLocatorFactory(SearchContext searchContext);
  public ElementLocator createLocator(Field field);
}
```

### AjaxElementLocator

```java
public class AjaxElementLocator extends DefaultElementLocator {
  public AjaxElementLocator(SearchContext searchContext, Field field, int timeOutInSeconds);
  public AjaxElementLocator(SearchContext searchContext, int timeOutInSeconds, AbstractAnnotations annotations);
  public AjaxElementLocator(Clock clock, SearchContext searchContext, Field field, int timeOutInSeconds);

  protected long sleepFor(); // Poll interval ms (default 250)
  protected boolean isElementUsable(WebElement element); // Default: element in DOM
}
```

### AjaxElementLocatorFactory

```java
public class AjaxElementLocatorFactory implements ElementLocatorFactory {
  public AjaxElementLocatorFactory(SearchContext searchContext, int timeOutInSeconds);
  public ElementLocator createLocator(Field field);
}
```

### FieldDecorator

```java
public interface FieldDecorator {
  Object decorate(ClassLoader loader, Field field);
}
```

### DefaultFieldDecorator

```java
public class DefaultFieldDecorator implements FieldDecorator {
  public DefaultFieldDecorator(ElementLocatorFactory factory);
  public Object decorate(ClassLoader loader, Field field);
  protected boolean isDecoratableList(Field field);
}
```

### ByAll

```java
public class ByAll extends By {
  public ByAll(By... bys);
  public WebElement findElement(SearchContext context);
  public List<WebElement> findElements(SearchContext context);
}
```

### ByChained

```java
public class ByChained extends By {
  public ByChained(By... bys);
  public WebElement findElement(SearchContext context);
  public List<WebElement> findElements(SearchContext context);
}
```

### Annotations

```java
public class Annotations extends AbstractAnnotations {
  public Annotations(Field field);
  public boolean isLookupCached();
  public By buildBy();
}
```

### AbstractAnnotations

```java
public abstract class AbstractAnnotations {
  public abstract By buildBy();
  public abstract boolean isLookupCached();
}
```
