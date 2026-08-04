---
name: selenium-shadow-root
description: Architectural patterns for Shadow DOM automation, SearchContext.getShadowRoot(), nested shadow root navigation, and Web Components element interaction. Trigger on Shadow DOM, shadow root, getShadowRoot, SearchContext, or Web Components.
metadata:
  keywords: ['selenium', 'shadow-dom', 'shadow-root', 'web-components', 'testing']
---

# Shadow DOM & Web Components Architecture

## 1. What Is It?

Shadow DOM is an HTML encapsulation standard isolating Web Components styles and element trees from the main document DOM.

## 2. Core Capabilities & Responsibilities

- **Shadow Tree Navigation (`getShadowRoot`)**: Provides access to encapsulated shadow trees (`SearchContext`) unreachable by standard driver queries.
- **Nested Shadow DOM Traversal**: Navigates multi-level encapsulated Web Components step-by-step.

## 3. Why Use It?

Standard `driver.findElement` calls cannot cross shadow boundaries in modern Web Components applications (Salesforce, Polymer, Lit), resulting in `NoSuchElementException`. Selenium 4 `SearchContext.getShadowRoot()` natively resolves shadow boundaries.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                  | Anti-Pattern                                                                                             |
| :--------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------- |
| **CSS Selectors Only**: Always use `By.cssSelector()` when searching within a `ShadowRoot`.    | **XPath inside ShadowRoot**: Attempting XPath queries inside a `ShadowRoot` context (violates W3C spec). |
| **Sequential Traversal**: In nested structures, retrieve each host's shadow root sequentially. | **Direct Inner Search**: Searching for encapsulated shadow elements directly from top-level `driver`.    |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_se_locator_docs`
- **Parameters**: `language` (`java` | `python` | `typescript` | `javascript` | `csharp` | `ruby`)
