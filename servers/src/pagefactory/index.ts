import { z } from 'zod';

export const PageFactoryApiQuerySchema = z.object({
  className: z
    .string()
    .max(128)
    .optional()
    .describe(
      'Optional class/annotation name to look up (e.g. "PageFactory", "AjaxElementLocator", "FindBy"). ' +
        'Omit to receive the full reference.'
    ),
});

export type PageFactoryApiQueryArgs = z.infer<typeof PageFactoryApiQuerySchema>;

const REFERENCE = `# API Reference — org.openqa.selenium.support & org.openqa.selenium.support.pagefactory

## org.openqa.selenium.support

### PageFactory
public class PageFactory — all members static; never instantiated directly.

initElements(SearchContext, Class<T>)  → Instantiates pageClassToProxy (prefers WebDriver constructor, falls back to no-arg) and decorates every WebElement/List<WebElement> field with a lazy proxy using the field name as id/name unless @FindBy overrides it.
initElements(SearchContext, Object)    → Decorates an already-constructed page object; use when the constructor needs args PageFactory cannot guess.
initElements(ElementLocatorFactory, Object) → Swaps in a custom factory (e.g. AjaxElementLocatorFactory).
initElements(FieldDecorator, Object)   → Full control — supply a custom FieldDecorator per field.

### @FindBy
@Retention(RUNTIME) @Target({FIELD,TYPE})
Elements: how(How, default UNSET), using(String), id, name, className, css, tagName, linkText, partialLinkText, xpath.
@FindBy(id="foo") == @FindBy(how=How.ID, using="foo"). Named attributes preferred; how/using only needed for ID_OR_NAME.

### @FindBys
@Retention(RUNTIME) @Target({FIELD,TYPE})
Element: value(FindBy[], required) — chains into ByChained (AND/nested semantics).
Example: @FindBys({@FindBy(id="foo"), @FindBy(className="bar")})

### @FindAll
@Retention(RUNTIME) @Target({FIELD,TYPE})
Element: value(FindBy[], required) — backs ByAll (OR semantics; order not guaranteed).
Example: @FindAll({@FindBy(id="foo"), @FindBy(className="bar")})

### @CacheLookup
@Retention(RUNTIME) @Target(FIELD) — marker, no elements.
Instructs PageFactory to look up the DOM node once and cache the reference. Never use on elements that can be replaced by JS/AJAX re-renders (→ StaleElementReferenceException).

### How (enum)
Constants: CLASS_NAME, CSS, ID, LINK_TEXT, NAME, PARTIAL_LINK_TEXT, TAG_NAME, XPATH, ID_OR_NAME, UNSET.
Methods: abstract By buildBy(String value), static How[] values(), static How valueOf(String name).
ID_OR_NAME is the one case where how/using is still commonly needed (no @FindBy shorthand exists for it).

### ByIdOrName
public class ByIdOrName extends By — backs How.ID_OR_NAME and PageFactory's field-name default.
Constructor: ByIdOrName(String idOrName).
Methods: findElement(SearchContext), findElements(SearchContext), toString().

## org.openqa.selenium.support.pagefactory

### ElementLocator (interface)
Methods: WebElement findElement(), List<WebElement> findElements().
Implementations: DefaultElementLocator, AjaxElementLocator.

### ElementLocatorFactory (interface)
Method: ElementLocator createLocator(Field field) — called per field; a new locator expected each call.
Implementations: DefaultElementLocatorFactory, AjaxElementLocatorFactory.

### DefaultElementLocator
public class DefaultElementLocator implements ElementLocator — lazy, understands @FindBy and @CacheLookup.
Constructors: (SearchContext, Field), (SearchContext, AbstractAnnotations).
Methods: findElement(), findElements(), protected boolean shouldCache(), toString().

### DefaultElementLocatorFactory
public final class DefaultElementLocatorFactory implements ElementLocatorFactory — used internally by PageFactory.initElements(SearchContext, ...).
Constructor: DefaultElementLocatorFactory(SearchContext).
Method: createLocator(Field) → returns DefaultElementLocator.

### AjaxElementLocator
public class AjaxElementLocator extends DefaultElementLocator — polls up to timeOutInSeconds for presence.
Constructors:
  (SearchContext, Field, int timeOutInSeconds)
  (SearchContext, int timeOutInSeconds, AbstractAnnotations)
  (Clock, SearchContext, Field, int timeOutInSeconds)
  (Clock, SearchContext, int timeOutInSeconds, AbstractAnnotations)
Field: protected final int timeOutInSeconds.
Methods:
  findElement() — polls until element present.
  findElements() — polls until ≥1 element present.
  protected long sleepFor() — poll interval ms (default 250); override to change.
  protected boolean isElementUsable(WebElement) — default: element in DOM. Override for visibility requirement.
Tip: avoid XPath on Ajax-decorated fields; expression re-evaluated on every poll.

### AjaxElementLocatorFactory
public class AjaxElementLocatorFactory implements ElementLocatorFactory.
Constructor: (SearchContext, int timeOutInSeconds).
Method: createLocator(Field) → returns AjaxElementLocator.

### FieldDecorator (interface)
Method: @Nullable Object decorate(ClassLoader loader, Field field) — return proxy or null to leave field undecorated.

### DefaultFieldDecorator
public class DefaultFieldDecorator implements FieldDecorator — decorates every WebElement field, and every List<WebElement> field annotated with @FindBy/@FindBys/@FindAll (unannotated List<WebElement> left null).
Constructor: DefaultFieldDecorator(ElementLocatorFactory factory).
Field: protected ElementLocatorFactory factory.
Methods: decorate(), isDecoratableList(Field), proxyForLocator(ClassLoader, ElementLocator), proxyForListLocator(ClassLoader, ElementLocator).

### ByAll
public class ByAll extends By — OR across multiple By locators; backs @FindAll.
Constructor: ByAll(By... bys).
Methods: findElement(SearchContext), findElements(SearchContext), toString().

### ByChained
public class ByChained extends By — AND/nested; each By searched within previous match; backs @FindBys.
Constructor: ByChained(By... bys).
Methods: findElement(SearchContext), findElements(SearchContext), toString().

### Annotations
public class Annotations extends AbstractAnnotations — reads @FindBy/@FindBys/@FindAll/@CacheLookup off a Field.
Constructor: Annotations(Field field).
Methods:
  boolean isLookupCached() — true if @CacheLookup present.
  By buildBy() — throws IllegalArgumentException if >1 annotation present; falls back to id-or-name from field name.
  protected By buildByFromDefault()
  protected Field getField()
  protected void assertValidAnnotations()

### AbstractAnnotations
public abstract class AbstractAnnotations — base; subclass only for fully custom annotation reading (rare).
Constructor: AbstractAnnotations().
Abstract methods: By buildBy(), boolean isLookupCached().`;

function filterByClass(content: string, className: string): string {
  const lower = className.toLowerCase();
  const sections = content.split(/\n(?=###? )/);
  const matched = sections.filter((s) => s.toLowerCase().includes(lower));
  return matched.length > 0
    ? matched.join('\n')
    : `No entry found for "${className}". Available classes: PageFactory, @FindBy, @FindBys, @FindAll, @CacheLookup, How, ByIdOrName, ElementLocator, ElementLocatorFactory, DefaultElementLocator, DefaultElementLocatorFactory, AjaxElementLocator, AjaxElementLocatorFactory, FieldDecorator, DefaultFieldDecorator, ByAll, ByChained, Annotations, AbstractAnnotations.`;
}

export function handlePageFactoryApiReference(args: PageFactoryApiQueryArgs) {
  const content = args.className ? filterByClass(REFERENCE, args.className) : REFERENCE;

  return {
    content: [
      {
        type: 'text' as const,
        text: content,
      },
    ],
  };
}
