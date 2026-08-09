# Page Object Model (POM) — Java API Reference (Selenium 4.x+)

> Official Selenium PageFactory support library (`org.openqa.selenium.support` & `org.openqa.selenium.support.pagefactory`) updated for Selenium 4 (4.46.0+).

---

## Code Examples

```java
package com.example.pages;

import static org.openqa.selenium.support.ui.ExpectedConditions.elementToBeClickable;
import static org.openqa.selenium.support.ui.ExpectedConditions.visibilityOf;

import java.time.Duration;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.support.FindBy;
import org.openqa.selenium.support.PageFactory;
import org.openqa.selenium.support.ui.WebDriverWait;

public class LoginPage {
    private final WebDriver driver;
    private final WebDriverWait wait;

    @FindBy(id = "username")
    private WebElement usernameInput;

    @FindBy(id = "password")
    private WebElement passwordInput;

    @FindBy(css = "button[type='submit']")
    private WebElement loginButton;

    public LoginPage(WebDriver driver) {
        this.driver = driver;
        this.wait = new WebDriverWait(driver, Duration.ofSeconds(10));
        PageFactory.initElements(driver, this);
    }

    public void login(String username, String password) {
        wait.until(visibilityOf(usernameInput)).sendKeys(username);
        wait.until(visibilityOf(passwordInput)).sendKeys(password);
        wait.until(elementToBeClickable(loginButton)).click();
    }
}
```

---

## org.openqa.selenium.support

### PageFactory

```java
public class PageFactory — all members static; never instantiated directly.

initElements(SearchContext, Class<T>)  → Instantiates pageClassToProxy and decorates every WebElement field.
initElements(SearchContext, Object)    → Decorates an already-constructed page object instance.
initElements(ElementLocatorFactory, Object) → Swaps in a custom locator factory (e.g. AjaxElementLocatorFactory).
initElements(FieldDecorator, Object)   → Decorates fields with custom decorator logic.
```

### @FindBy

```java
@Retention(RUNTIME) @Target({FIELD,TYPE})
// Elements: how(How), using(String), id, name, className, css, tagName, linkText, partialLinkText, xpath.
@FindBy(id="foo") // Equivalent to @FindBy(how=How.ID, using="foo").
```

### @FindBys

```java
@Retention(RUNTIME) @Target({FIELD,TYPE})
// Element: value(FindBy[]) — chains into ByChained (AND/nested semantics).
@FindBys({@FindBy(id="foo"), @FindBy(className="bar")})
```

### @FindAll

```java
@Retention(RUNTIME) @Target({FIELD,TYPE})
// Element: value(FindBy[]) — backs ByAll (OR semantics).
@FindAll({@FindBy(id="foo"), @FindBy(className="bar")})
```

### @CacheLookup

```java
@Retention(RUNTIME) @Target(FIELD)
// Caches DOM reference after first lookup. Do not use on dynamic AJAX re-renders.
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

---

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
  protected long sleepFor(); // Poll interval ms (default 250)
  protected boolean isElementUsable(WebElement element);
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
}
```

### ByAll

```java
public class ByAll extends By {
  public ByAll(By... bys);
}
```

### ByChained

```java
public class ByChained extends By {
  public ByChained(By... bys);
}
```

### Annotations

```java
public class Annotations extends AbstractAnnotations {
  public Annotations(Field field);
}
```

### AbstractAnnotations

```java
public abstract class AbstractAnnotations {
  public abstract By buildBy();
  public abstract boolean isLookupCached();
}
```
