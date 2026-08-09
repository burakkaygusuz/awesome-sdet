---
name: selenium-design-patterns
description: 'Enterprise test design patterns: Page Object Model (POM), LoadableComponent, Action Bot, and Fluent Interface. Trigger on POM, LoadableComponent, or Action Bot.'
user-invocable: true
license: MIT
compatibility: Selenium 4.x+
metadata:
  framework: selenium
  keywords:
    - page-object-model
    - pom
    - loadable-component
    - action-bot
    - page-component-object
    - fluent-interface
---

# Enterprise Selenium Design Patterns

## 1. What Is It?

A suite of enterprise software design patterns separating test intent from page structural locators and low-level driver commands in automated test frameworks.

## 2. Core Capabilities & Responsibilities

- **Page Object Model (POM)**: Encapsulates page elements and UI interaction logic.
- **LoadableComponent**: Guarantees page readiness and loaded state prior to element interaction.
- **Page Component Objects**: Modularizes reusable UI components (Header, Footer, Navigation, Data Grids).
- **Action Bot Pattern**: Wraps raw driver commands with defensive wait strategies and diagnostic logging.
- **Fluent Interface**: Chains page object method calls to express readable domain user journeys.

## 3. Why Use It?

Eliminates code duplication across test scripts, minimizes framework maintenance costs during UI layout changes, and prevents monolithic (God) Page Objects in complex enterprise applications.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                                                       | Anti-Pattern                                                                                                    |
| :------------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------- |
| **Keep Assertions in Tests**: Page objects return page objects or data types; test assertions belong in test cases. | **Assertions inside Page Objects**: Embedding assertion verification calls directly inside page object classes. |
| **Component Modularization**: Break complex layouts into reusable Page Component objects.                           | **God Page Object**: Concentrating hundreds of element locators into a single monolithic class.                 |
| **Encapsulate Driver**: Delegate driver interaction through page object methods or an Action Bot.                   | **Raw Driver Leakage**: Calling `driver.findElement().click()` directly inside test bodies.                     |

## 5. Dynamic Tool Schemas & API Reference

Fetch language-specific code implementations and API schemas using the `sdet-mcp` tool:

- **Tool**: `read_se_pagefactory_docs`
- **Parameters**: `language` (`java` | `python` | `typescript` | `javascript` | `csharp` | `ruby`)
