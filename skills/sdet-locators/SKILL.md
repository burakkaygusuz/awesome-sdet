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

## 3. When to Use

- **When to Use**:
  - Designing, querying, or refactoring element locators for Web, Mobile, or Hybrid applications.
  - Migrating brittle CSS/XPath test suites to resilient accessibility-first locators.
  - Scoping queries inside nested components, data tables, modals, or Shadow DOM roots.
  - Defining locators within Page Object Models (POM) or Screen Object Models (SOM).

- **When NOT to Use (Route to Neighboring Skills)**:
  - Performing clicks, fills, drag-and-drop, or gestures -> Use [sdet-actions](../sdet-actions/SKILL.md).
  - Asserting element visibility, state, or text values -> Use [sdet-assertions](../sdet-assertions/SKILL.md).
  - Mobile-specific device lifecycle or driver capabilities -> Use [sdet-mobile](../sdet-mobile/SKILL.md).

## 4. Universal Framework Paradigm Mapping

| Automation Framework | Canonical Primary Strategy                              | Scoping & Filtering                             | Piercing & Traversal                              |
| :------------------- | :------------------------------------------------------ | :---------------------------------------------- | :------------------------------------------------ |
| **Playwright**       | `page.getByRole()`, `getByLabel()`, `getByTestId()`     | `.filter({ hasText, has })`, `.or()`, `.and()`  | Automatic Shadow DOM piercing                     |
| **Cypress**          | `cy.get('[data-testid=...]')`, `cy.contains()`          | `.within(() => ...)`, `.filter()`               | `.shadow().find(...)`                             |
| **Selenium 4**       | `driver.findElement(By.cssSelector(...))`               | W3C Relative Locators (`with().above().near()`) | `element.getShadowRoot().findElement(...)`        |
| **Vibium**           | `vibe.find({ role: '...' })`, `{ label }`, `{ testid }` | Subtree chaining (`el.find(...)`)               | `>>` (one boundary), `>>>` (any depth)            |
| **Appium**           | `driver.findElement(AppiumBy.accessibilityId(...))`     | iOS Class Chains, Android `UiScrollable`        | Native context switching (`WEBVIEW`/`NATIVE_APP`) |

## 5. Dynamic MCP Knowledge & Tool Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke consolidated `sdet-mcp` tools:

- **Playwright Locators**: When selecting elements in Playwright, invoke `read_pw_docs` (Parameters: `domain: "locators"`, `language: "typescript" | "javascript" | "python" | "java" | "csharp"`).
- **Cypress Locators & Shadow DOM**: When selecting elements in Cypress or piercing Shadow DOM, invoke `read_cy_docs` (Parameters: `domain: "commands" | "shadow"`, `language: "typescript" | "javascript"`).
- **Selenium Locators**: When authoring Selenium By queries or Relative Locators, invoke `read_se_docs` (Parameters: `domain: "locators"`, `language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby"`).
- **Vibium Selectors**: When querying elements with semantic or piercing selectors in Vibium, invoke `read_vibium_docs` (Parameters: `domain: "selectors"`, `language: "typescript" | "javascript" | "python" | "java"`).
- **Appium Locators**: When authoring mobile selectors across Android and iOS, invoke `read_appium_docs` (Parameters: `domain: "locators"`, `language: "typescript" | "javascript" | "python" | "java" | "csharp"`).

Universal quality invariants and execution rules are accessible via `sdet://guidelines` and `sdet://invariants`.
