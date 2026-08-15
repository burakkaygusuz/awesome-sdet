---
name: sdet-locators
description: 'Use this skill when authoring, querying, or refactoring UI element locators and selectors. Trigger when finding elements by accessible role or name, converting brittle XPath/CSS to semantic selectors, piercing Shadow DOM, or scoping within tables, lists, and modals.'
user-invocable: true
license: MIT
metadata:
  capability: 'locators'
  frameworks: 'cypress,selenium,vibium,appium,playwright'
---

# Universal Semantic Locators & Target Selection Architecture

## 1. Overview

Element location is the foundational bridge between automated test logic and the application under test (AUT). Modern test automation rejects implementation-dependent targeting (e.g., brittle CSS hierarchies, auto-generated IDs, absolute XPath paths) in favor of **Accessibility-First Semantic Locators**.

Semantic locators identify UI elements exactly as users and assistive technologies perceive them—via explicit accessibility roles, accessible names, visible text labels, and dedicated test identifiers. This ensures tests are resilient against CSS refactoring, DOM re-structuring, component redesigns, and framework migrations.

## 2. Core Invariants & Universal Rules

1. **Accessibility-First Priority Hierarchy**: Always resolve locators using the following priority order:
   - **Tier 1 (Semantic Role & Name)**: ARIA role + accessible name (e.g., `button`, `checkbox`, `dialog` with accessible label).
   - **Tier 2 (Visible Text & Label Association)**: Associated `<label>`, placeholder text, or distinct button/heading text.
   - **Tier 3 (Dedicated Test Attributes)**: Dedicated test IDs (`data-testid`, `data-cy`, `accessibilityIdentifier`) when semantic roles are ambiguous.
   - **Forbidden / Anti-Pattern**: Brittle CSS classes (`.btn-primary.v2`), dynamic DOM IDs (`#input-1234`), and absolute XPath chains (`/html/body/div[2]/...`).
2. **Lazy Evaluation & Dynamic Re-Querying**: Never capture or store static DOM snapshots or raw element pointers that can go stale. Locators must represent lazy, dynamically evaluated queries executed on-demand.
3. **Strictness & Multi-Element Disambiguation**: By default, locators targeting single interactive elements must enforce strict single-element resolution. Ambiguities must be resolved via subtree scoping or semantic filtering, never by blindly selecting `.first()` or index `0`.
4. **Shadow DOM & Piercing Discipline**: Encapsulated Web Components must be traversed using native framework piercing mechanisms or open shadow root handles rather than brittle JavaScript evaluations.

### Best Practices vs. Anti-Patterns

| Category              | Best Practice                                                                    | Anti-Pattern                                                           |
| :-------------------- | :------------------------------------------------------------------------------- | :--------------------------------------------------------------------- |
| **Element Targeting** | Anchor on ARIA roles and accessible names (`role="button"`, name `"Save"`).      | Binding to utility CSS classes (`.flex.items-center.py-2`).            |
| **Dynamic IDs**       | Use dedicated `data-testid="submit-order"` for non-semantic elements.            | Binding to dynamic framework-generated IDs (`#react-aria-123`).        |
| **Strict Resolution** | Scope parent containers (`list.filter({ hasText: 'Item' })`) to resolve matches. | Slapping `.first()` or index `[0]` on ambiguous multi-match sets.      |
| **DOM Traversal**     | Scope queries within container elements or parent cards.                         | Searching the global root DOM document repeatedly across nested steps. |
| **Stale Elements**    | Pass lazy locator objects between page objects and helpers.                      | Storing raw element references across navigation or DOM changes.       |

## 3. When to Use

- **When to Use**:
  - Designing, querying, or refactoring element locators for Web, Mobile, or Hybrid applications.
  - Migrating brittle CSS/XPath test suites to resilient accessibility-first locators.
  - Scoping queries inside nested components, data tables, modals, or Shadow DOM roots.
  - Defining locator locators within Page Object Models (POM) or Screen Object Models (SOM).

- **When NOT to Use (Route to Neighboring Skills)**:
  - Performing clicks, fills, drag-and-drop, or gestures -> Use [sdet-actions](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-actions/SKILL.md).
  - Asserting element visibility, state, or text values -> Use [sdet-assertions](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-assertions/SKILL.md).
  - Mobile-specific device lifecycle or driver capabilities -> Use [sdet-mobile](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-mobile/SKILL.md).

## 4. Universal Framework Paradigm Mapping

| Automation Framework | Canonical Primary Strategy                          | Scoping & Filtering                             | Piercing & Traversal                              |
| :------------------- | :-------------------------------------------------- | :---------------------------------------------- | :------------------------------------------------ |
| **Playwright**       | `page.getByRole()`, `getByLabel()`, `getByTestId()` | `.filter({ hasText, has })`, `.or()`, `.and()`  | Automatic Shadow DOM piercing                     |
| **Cypress**          | `cy.get('[data-cy=...]')`, `cy.contains()`          | `.within(() => ...)`, `.filter()`               | `.shadow().find(...)`                             |
| **Selenium 4**       | `driver.findElement(By.cssSelector(...))`           | W3C Relative Locators (`with().above().near()`) | `element.getShadowRoot().findElement(...)`        |
| **Vibium**           | `browser.find({ role: '...' })`, `label`, `testid`  | Subtree chaining and state filtering            | Shadow piercing combinators (`>>`, `>>>`)         |
| **Appium**           | `driver.findElement(AppiumBy.accessibilityId(...))` | iOS Class Chains, Android `UiScrollable`        | Native context switching (`WEBVIEW`/`NATIVE_APP`) |

## 5. Dynamic MCP Tool & Resource Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `sdet-mcp` tools or read dynamic resources:

- **Playwright**: `read_pw_locators_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URI: `playwright://locators/{language}`
- **Cypress**: `read_cy_commands_docs`, `read_cy_shadow_docs` (Parameters: `language: "typescript" | "javascript"`) -> URIs: `cypress://commands/{language}`, `cypress://shadow/{language}`
- **Selenium**: `read_se_locator_docs` (Parameters: `language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby"`) -> URI: `selenium://locators/{language}`
- **Vibium**: `read_vibium_selectors_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java"`) -> URI: `vibium://selectors/{language}`
- **Appium**: `read_appium_locators_docs` (Parameters: `strategy: "accessibility_id" | "ios_class_chain" | "ios_predicate_string" | "android_uiautomator" | "id" | "xpath"`, `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URI: `appium://locators/{language}`
