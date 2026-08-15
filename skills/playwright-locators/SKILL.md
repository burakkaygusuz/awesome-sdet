---
name: playwright-locators
description: 'Accessibility-first semantic locator strategies, filtering, chaining, and multi-element selection in Playwright across TypeScript, Python, Java, and C#.'
user-invocable: true
license: MIT
compatibility: Playwright 1.x+
metadata:
  framework: playwright
  keywords:
    - playwright
    - locators
    - semantic-locators
    - get-by-role
    - get-by-text
    - get-by-label
    - get-by-placeholder
    - get-by-alt-text
    - get-by-title
    - get-by-test-id
    - filtering
    - chaining
    - strict-mode
---

# Semantic Locators & Filtering Architecture

## 1. What Is It?

Playwright Locators represent an auto-refreshing, strict pointer to DOM element(s) on the page. Unlike legacy element handles (`ElementHandle`), Locators do not capture static DOM snapshots; instead, they re-evaluate the DOM query dynamically prior to every interaction, completely eliminating stale element exceptions.

Playwright mandates an **Accessibility-First** targeting hierarchy, prioritizing user-facing semantics (`getByRole`, `getByText`, `getByLabel`, `getByPlaceholder`, `getByAltText`, `getByTitle`, `getByTestId`) over implementation details like CSS class names or XPath hierarchies.

## 2. Core Capabilities & Responsibilities

- **Semantic User-Facing Locators**: Locates elements matching user perception and assistive technologies:
  - `page.getByRole(role, { name })`: Queries elements by ARIA role and accessible name.
  - `page.getByText(text, { exact })`: Matches text content displayed to the user.
  - `page.getByLabel(text)`: Finds form controls by associated `<label>` or `aria-labelledby`.
  - `page.getByPlaceholder(text)`: Finds inputs by placeholder attribute.
  - `page.getByAltText(text)`: Finds images or graphic elements by `alt` text.
  - `page.getByTitle(text)`: Targets elements by `title` attribute or SVG `<title>`.
  - `page.getByTestId(id)`: Targets dedicated test attributes (`data-testid`).
- **Strict Mode Compliance**: If a locator matches multiple elements, performing an action throws a strictness violation error rather than interacting with an arbitrary node.
- **Locator Filtering & Chaining**:
  - **Subtree Chaining**: Nests locators to scope searches: `page.getByRole('listitem').getByRole('button')`.
  - **Filtering (`.filter()`)**: Refines locator sets: `locator.filter({ hasText: 'Active' })`, `locator.filter({ has: page.getByRole('checkbox') })`.
- **Logical Combinators (`.or()`, `.and()`)**: Combines locators with `.or()` (fallback matching) or `.and()` (intersection matching).
- **Multi-Element Selection**: Enumerates multi-match sets deterministically via `.all()`, `.count()`, `.first()`, `.last()`, or `.nth(index)`.

## 3. Why Use It?

Web applications frequently undergo CSS refactoring, responsive design overhauls, and layout redesigns. Targeting elements via ARIA roles and accessible names ensures that tests break only when user-facing functionality or accessibility breaks, not when styling classes or DOM nesting changes.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                               | Anti-Pattern                                                                                           |
| :---------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------------------------------------------------- |
| **Prioritize ARIA Roles**: `page.getByRole('button', { name: 'Save' })` for user-perceived elements.        | **Brittle CSS Classes**: `page.locator('.btn-primary.save-v2.btn-lg')` breaking on CSS refactoring.    |
| **Use `.filter({ hasText })`**: Refine lists using semantic sub-element filters.                            | **Fragile XPath Axes**: `page.locator('//tr[td[contains(text(),"Active")]]/td[3]/button')`.            |
| **Strict Mode Discipline**: Resolve ambiguous matches with `.filter()` or scoping.                          | **Blind `.first()` Hacks**: Slapping `.first()` onto ambiguous locators to silence strict mode errors. |
| **Dedicated Test IDs for Unlabeled Elements**: `page.getByTestId('canvas-layer')` when no ARIA role exists. | **Dynamic DOM IDs**: Binding to auto-generated IDs like `page.locator('#react-select-3-input')`.       |
| **Keep Locators Lazy**: Chain and pass `Locator` objects between page objects and helpers.                  | **Stale Element Handles**: Evaluating `await page.$('button')` and holding stale references.           |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_pw_locators_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java` | `csharp`)
- **Resource URI**: `playwright://locators/{language}`
