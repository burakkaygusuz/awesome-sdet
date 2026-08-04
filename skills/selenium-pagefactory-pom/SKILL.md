---
name: selenium-pagefactory-pom
description: PageFactory and Page Object Model patterns, element initialization, `@FindBy` locators, and lazy initialization. Trigger on PageFactory, `@FindBy`, `@FindBys`, `@FindAll`, `@CacheLookup`, or Page Object initialization.
metadata:
  keywords: ['selenium', 'pagefactory', 'pom', 'findby', 'testing']
---

# PageFactory & Page Object Model Architecture

## 1. What Is It?

PageFactory extends the Page Object Model by providing lazy element initialization and annotation-driven element location strategies.

## 2. Core Capabilities & Responsibilities

- **Lazy Element Initialization**: Elements are evaluated via proxies upon interaction rather than during page object creation.
- **Location Strategies**: Direct locators (`@FindBy`), cached locators (`@CacheLookup`), and composite locators (`@FindBys` / `@FindAll`).

## 3. Why Use It?

Prevents `NoSuchElementException` when page elements are not yet present during initial DOM load, and improves test performance by caching static elements.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                | Anti-Pattern                                                                                                                      |
| :------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------- |
| **Selective Caching**: Apply `@CacheLookup` only to static, immutable UI elements.           | **Caching Dynamic Elements**: Applying `@CacheLookup` to elements updated via AJAX/SPA, causing `StaleElementReferenceException`. |
| **Initialize on Page Transition**: Initialize page objects upon entering a new page context. | **Uninitialized Proxies**: Interacting with proxy elements prior to PageFactory initialization.                                   |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_se_pagefactory_docs`
- **Parameters**: `language` (`java` | `python` | `typescript` | `javascript` | `csharp` | `ruby`)
