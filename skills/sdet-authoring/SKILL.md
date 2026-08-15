---
name: sdet-authoring
description: 'Use this skill when structuring test automation architecture, designing Page Object Models (POM), authoring component mount tests, configuring test fixtures and lifecycle hooks, or setting up parallel test execution topologies.'
user-invocable: true
license: MIT
metadata:
  capability: 'authoring'
  frameworks: 'cypress,selenium,vibium,appium,playwright'
---

# Test Authoring, Page Object Models & Scalable Test Architecture

## 1. Overview

Writing maintainable, enterprise-grade test automation requires disciplined software engineering principles. As test suites scale to thousands of test cases across distributed CI/CD workers, monolithic or copy-pasted test scripts quickly become unmaintainable liabilities.

**Test Authoring Architecture** establishes clean design patterns (Page Object Model, Screen Object Model, App Actions, Custom Fixtures, Component Mount Testing), deterministic lifecycle hook execution (`beforeAll`, `beforeEach`, `afterEach`, `afterAll`), and scalable parallel worker topologies that guarantee zero test cross-talk.

## 2. Core Invariants & Universal Rules

1. **Clean Separation of Concerns**:
   - **Page Objects / Screen Objects**: Encapsulate element locators, component interactions, and navigation mechanics. Page objects must _never_ contain test assertions or hardcoded expectations.
   - **Test Spec Files**: Contain the business workflows, scenario orchestration, and all validation assertions.
2. **Lazy Locator Getters vs. Stale Elements**: Page objects must expose lazy locator properties or helper methods that re-evaluate queries on invocation, rather than caching static element handles in constructor properties.
3. **Composable Custom Fixtures**: Prefer modular, composable dependency injection fixtures (e.g. Playwright `test.extend()`, Cypress custom commands) over sprawling global helper singletons.
4. **Idempotent Lifecycle Hooks**: Setup and teardown hooks (`beforeEach`, `afterEach`) must be idempotent and self-contained. Never create temporal dependencies where Test B relies on mutations produced by Test A.
5. **Parallel Worker Safety & Thread Isolation**: Never use global mutable variables or shared singleton drivers across parallel execution threads. Every worker must own an independent driver/browser instance.

### Best Practices vs. Anti-Patterns

| Category              | Best Practice                                                    | Anti-Pattern                                                                    |
| :-------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------ |
| **Assertions**        | Keep all `expect()` assertions inside test spec files.           | Embedding hidden assertions inside Page Object interaction methods.             |
| **Page Objects**      | Expose lazy locator getters (`get submitBtn() { return ... }`).  | Caching `this.button = await page.$('...')` in constructors.                    |
| **Test Independence** | Design every test case to run independently in any order.        | Forcing tests to execute sequentially (Test 1 creates user, Test 2 edits user). |
| **Fixtures**          | Extend base test runners with composable, typed fixtures.        | Copy-pasting 30 lines of boilerplate setup across every spec file.              |
| **Parallel Safety**   | Maintain ThreadLocal driver handles or worker-isolated contexts. | Sharing a static global `WebDriver driver` across concurrent threads.           |

## 3. When to Use

- **When to Use**:
  - Structuring new test repositories, Page Object Models (POM), or Screen Object Models (SOM).
  - Authoring custom test runner fixtures, extensions, and lifecycle hooks.
  - Designing isolated test topologies for parallel execution across CI/CD matrices.
  - Setting up Component Testing / Storybook test mount harnesses.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Querying element selectors -> Use [sdet-locators](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-locators/SKILL.md).
  - Executing user actions and inputs -> Use [sdet-actions](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-actions/SKILL.md).
  - Setting up session state snapshots and cookies -> Use [sdet-storage-state](file:///Users/burak/Documents/GitHub/awesome-sdet/skills/sdet-storage-state/SKILL.md).

## 4. Universal Framework Paradigm Mapping

| Automation Framework | Modeling Pattern                                       | Fixture & Dependency Injection           | Component & Parallel Topologies                     |
| :------------------- | :----------------------------------------------------- | :--------------------------------------- | :-------------------------------------------------- |
| **Playwright**       | Pure POM (constructor injection with `page: Page`)     | `test.extend<T>()` modular test fixtures | Component testing via `mount()`, worker parallelism |
| **Cypress**          | App Actions / Custom Commands (`Cypress.Commands.add`) | Shared fixtures (`cy.fixture()`)         | Component testing with `cy.mount()`                 |
| **Selenium 4**       | Page Object Model / Fluent Method Chaining             | `ThreadLocal<WebDriver>` driver factory  | Selenium Grid 4 distributed node topology           |
| **Vibium**           | Declarative workflows & SDK page helpers               | Environment configuration fixtures       | Isolated browser contexts                           |
| **Appium**           | Screen Object Model (SOM)                              | Multi-platform driver factory            | Parallel mobile execution via unique system ports   |

## 5. Dynamic MCP Tool & Resource Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `sdet-mcp` tools or read dynamic resources:

- **Playwright**: `read_pw_locators_docs`, `read_pw_actions_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URIs: `playwright://locators/{language}`, `playwright://actions/{language}`
- **Cypress**: `read_cy_component_docs`, `read_cy_commands_docs`, `read_cy_task_docs` (Parameters: `language: "typescript" | "javascript"`) -> URIs: `cypress://component/{language}`, `cypress://commands/{language}`, `cypress://task/{language}`
- **Selenium**: `read_se_pagefactory_docs`, `read_se_locators_docs` (Parameters: `language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby"`) -> URIs: `selenium://pagefactory/{language}`, `selenium://locators/{language}`
- **Vibium**: `read_vibium_core_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java"`) -> URI: `vibium://core/{language}`
- **Appium**: `read_appium_capabilities_docs`, `read_appium_locators_docs` (Parameters: `language: "typescript" | "javascript" | "python" | "java" | "csharp"`) -> URIs: `appium://capabilities/{language}`, `appium://locators/{language}`
