---
name: sdet-locators
description: 'Use this skill when authoring, querying, or refactoring UI element selectors and locators. Trigger when finding elements by accessible role or name, replacing brittle CSS/XPath with semantic selectors, piercing Shadow DOM, or scoping within tables, lists, and modals, even if not explicitly mentioned.'
user-invocable: true
license: MIT
metadata:
  capability: 'locators'
  frameworks: 'cypress,selenium,vibium,appium,playwright'
---

# Universal Semantic Locators & Target Selection Architecture

## 1. Overview

Accessibility-first semantic locators identify UI elements via ARIA roles, accessible names, visible text, and test IDs to ensure tests remain resilient against CSS refactoring and DOM redesigns.

## 2. Core Invariants & Universal Rules

1. **Accessibility-First Targeting Hierarchy**: Prioritize ARIA roles, accessible names, visible text labels, and dedicated test IDs (`data-testid`) over CSS classes or XPath chains, because semantic selectors mirror actual user and screen-reader interactions and remain resilient during UI redesigns.
2. **Lazy Evaluation Over Stale References**: Author locators as dynamically evaluated queries rather than caching static DOM references, because lazy locators automatically re-query the live DOM and prevent StaleElementReference errors.
3. **Strict Single-Element Resolution**: Require queries targeting individual interactive elements to resolve unambiguously to a single node, because blindly indexing with `.first()` masks duplicate element regressions in UI components.
4. **Container Scoping Over Global Queries**: Scope element searches inside parent container elements, table rows, or modal dialogs (`container.getByRole(...)`), because scoped queries eliminate cross-component selector ambiguities.
5. **Standard Shadow DOM Piercing**: Traverse encapsulated Web Components using native framework piercing mechanisms rather than brittle JavaScript shadow root evaluations.

### Gotchas & Critical Traps

- **Hidden Accessibility Names**: Elements with `aria-hidden="true"`, `display: none`, or `visibility: hidden` are omitted from the accessibility tree and cannot be matched by `getByRole`.
- **Ambiguous Text Matching**: Generic text queries like `getByText('Submit')` match both paragraph text and buttons; disambiguate with explicit role filters (`getByRole('button', { name: 'Submit' })`).
- **XPath Piercing Limitations**: Native browser XPath engines cannot pierce open or closed Shadow DOM boundaries; use semantic selectors or framework piercing combinators (`>>`, `>>>`).

## 3. Step-by-Step Workflow

1. **Examine Semantic Role & Accessible Name**: Inspect the target element for explicit ARIA roles, labels, or visible text.
2. **Apply Locator Priority**: Choose `getByRole` > `getByLabel` > `getByText` > `getByTestId`. Avoid full-tree DOM paths or class names.
3. **Scope to Parent Container**: When locating repetitive items (e.g. table rows, cards), scope within the parent container (`card.getByRole(...)`).
4. **Enforce Deterministic Resolution**: Ensure the locator resolves unambiguously to a single node and verify via `verify_test_artifact`.

## 4. When to Use

- **When to Use**:
  - Designing, querying, or refactoring element locators for Web, Mobile, or Hybrid applications.
  - Migrating brittle CSS/XPath test suites to resilient accessibility-first locators.
  - Scoping queries inside nested components, data tables, modals, or Shadow DOM roots.
  - Defining locators within Page Object Models (POM) or Screen Object Models (SOM).

- **When NOT to Use (Route to Neighboring Skills)**:
  - Performing clicks, fills, drag-and-drop, or gestures -> Use [sdet-actions](../sdet-actions/SKILL.md).
  - Asserting element visibility, state, or text values -> Use [sdet-assertions](../sdet-assertions/SKILL.md).
  - Mobile-specific device lifecycle or driver capabilities -> Use [sdet-mobile](../sdet-mobile/SKILL.md).

## 5. Universal Framework Paradigm Mapping

| Automation Framework | Canonical Primary Strategy                              | Scoping & Filtering                             | Piercing & Traversal                              |
| :------------------- | :------------------------------------------------------ | :---------------------------------------------- | :------------------------------------------------ |
| **Playwright**       | `page.getByRole()`, `getByLabel()`, `getByTestId()`     | `.filter({ hasText, has })`, `.or()`, `.and()`  | Automatic Shadow DOM piercing                     |
| **Cypress**          | `cy.get('[data-testid=...]')`, `cy.contains()`          | `.within(() => ...)`, `.filter()`               | `.shadow().find(...)`                             |
| **Selenium 4**       | `driver.findElement(By.cssSelector(...))`               | W3C Relative Locators (`with().above().near()`) | `element.getShadowRoot().findElement(...)`        |
| **Vibium**           | `vibe.find({ role: '...' })`, `{ label }`, `{ testid }` | Subtree chaining (`el.find(...)`)               | `>>` (one boundary), `>>>` (any depth)            |
| **Appium**           | `driver.findElement(AppiumBy.accessibilityId(...))`     | iOS Class Chains, Android `UiScrollable`        | Native context switching (`WEBVIEW`/`NATIVE_APP`) |

## 6. Dynamic MCP Knowledge & Tool Schemas (Level 3 On-Demand Code Delivery)

`read_sdet_docs({ framework, domain, query })` — `language` optional (framework default). Domains for this capability:

- Playwright `locators` · Cypress `commands` | `shadow` · Selenium `locators` · Vibium `selectors` · Appium `locators`

Universal invariants: `sdet://guidelines` · `sdet://invariants`.

## 7. Verification Checklist

- [ ] Zero brittle XPath (`//html/body/...`) or deep CSS selectors.
- [ ] Accessible roles, labels, or test IDs prioritized.
- [ ] Queries scoped within parent containers to eliminate ambiguity.
- [ ] Validated via `verify_test_artifact({ code, framework, language })` with 100/100 score.
