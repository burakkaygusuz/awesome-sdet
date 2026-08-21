---
name: sdet-authoring
description: 'Use this skill when structuring test automation suites, designing Page Object Models (POM) or Screen Object Models (SOM), authoring component mount tests, configuring custom test fixtures, setting up lifecycle hooks, or organizing parallel execution topologies.'
user-invocable: true
license: MIT
metadata:
  capability: 'authoring'
  frameworks: 'cypress,selenium,vibium,appium,playwright'
---

# Test Authoring, Page Object Models & Scalable Test Architecture

## 1. Overview

Scalable test authoring establishes clean structural design patterns (Page Object Model, Screen Object Model, custom fixtures, component testing) and idempotent lifecycle hooks to guarantee isolated, parallel execution without test cross-talk.

## 2. Core Invariants & Universal Rules

1. **Separation of Page Objects and Assertions**: Keep element definitions and interaction workflows in Page Objects, but place all assertions in test spec files, because mixing assertions into page models prevents using the same page actions in negative or alternative test cases.
2. **Lazy Locator Getters**: Expose dynamic getter properties or locator factory methods in Page Objects rather than resolving elements in the constructor, because cached element references throw StaleElementReference exceptions upon DOM re-renders.
3. **Composable Dependency Injection Fixtures**: Use modular, scoped test fixtures (e.g. Playwright `test.extend()`, Cypress custom commands) instead of global singleton classes, because global singletons leak mutable state across concurrent worker threads.
4. **Idempotent & Independent Lifecycle**: Author `beforeEach` and `afterEach` hooks to be fully self-contained, because tests that depend on execution order fail unpredictably in parallel test runs.
5. **Thread-Isolated Driver Instances**: Ensure every parallel worker manages an independent browser or driver instance, because shared drivers cause race conditions and session hijacking in CI.

### Gotchas & Critical Traps

- **Async Constructors in Page Objects**: Class constructors cannot be async; avoid performing network or DOM initialization in constructors—use static async factory methods or fixture injection instead.
- **Global Hook State Leaks**: Setting shared mutable variables in `beforeAll` hooks causes subtle race conditions and test pollution across parallel worker shards.
- **Over-Abstracted Base Classes**: Deep multi-level inheritance hierarchies in test base classes obscure test failure origins and create rigid framework lock-in.

## 3. Step-by-Step Workflow

1. **Model Page/Screen Components**: Encapsulate locators and interaction chains inside focused Page Objects or Screen Objects.
2. **Inject Test Fixtures**: Configure modular fixtures (`test.extend()`, `ThreadLocal` factory) for dependency injection.
3. **Preserve Assertion Boundaries**: Keep assertions strictly in test spec files, never inside page helper methods.
4. **Enforce State Teardown**: Write idempotent cleanup in `afterEach` or fixture teardown hooks and verify via `verify_test_artifact`.

## 4. When to Use

- **When to Use**:
  - Structuring new test repositories, Page Object Models (POM), or Screen Object Models (SOM).
  - Authoring custom test runner fixtures, extensions, and lifecycle hooks.
  - Designing isolated test topologies for parallel execution across CI/CD matrices.
  - Setting up Component Testing / Storybook test mount harnesses.

- **When NOT to Use (Route to Neighboring Skills)**:
  - Querying element selectors -> Use [sdet-locators](../sdet-locators/SKILL.md).
  - Executing user actions and inputs -> Use [sdet-actions](../sdet-actions/SKILL.md).
  - Setting up session state snapshots and cookies -> Use [sdet-storage-state](../sdet-storage-state/SKILL.md).

## 5. Universal Framework Paradigm Mapping

| Automation Framework | Modeling Pattern                                       | Fixture & Dependency Injection           | Component & Parallel Topologies                     |
| :------------------- | :----------------------------------------------------- | :--------------------------------------- | :-------------------------------------------------- |
| **Playwright**       | Pure POM (constructor injection with `page: Page`)     | `test.extend<T>()` modular test fixtures | Component testing via `mount()`, worker parallelism |
| **Cypress**          | App Actions / Custom Commands (`Cypress.Commands.add`) | Shared fixtures (`cy.fixture()`)         | Component testing with `cy.mount()`                 |
| **Selenium 4**       | Page Object Model / Fluent Method Chaining             | `ThreadLocal<WebDriver>` driver factory  | Selenium Grid 4 distributed node topology           |
| **Vibium**           | Declarative workflows & SDK page helpers               | Environment configuration fixtures       | Isolated browser contexts                           |
| **Appium**           | Screen Object Model (SOM)                              | Multi-platform driver factory            | Parallel mobile execution via unique system ports   |

## 6. Dynamic MCP Knowledge & Tool Schemas (Level 3 On-Demand Code Delivery)

To fetch complete, language-specific code implementations without context pollution, invoke `read_sdet_docs`:

- **Playwright Architecture**: When structuring Playwright POM, fixtures, or component tests, invoke `read_sdet_docs({ framework: "playwright", domain: "locators" | "actions", language: "typescript" | "javascript" | "python" | "java" | "csharp" })`.
- **Cypress Architecture**: When structuring Cypress component tests, commands, or tasks, invoke `read_sdet_docs({ framework: "cypress", domain: "component" | "commands" | "task", language: "typescript" | "javascript" })`.
- **Selenium POM & PageFactory**: When structuring Selenium Page Object Models or PageFactory patterns, invoke `read_sdet_docs({ framework: "selenium", domain: "pagefactory" | "locators", language: "java" | "python" | "typescript" | "javascript" | "csharp" | "ruby" })`.
- **Vibium Architecture**: When structuring Vibium workflows and page helpers, invoke `read_sdet_docs({ framework: "vibium", domain: "core", language: "typescript" | "javascript" | "python" | "java" })`.
- **Appium Screen Objects**: When structuring Appium Screen Object Models or multi-platform factories, invoke `read_sdet_docs({ framework: "appium", domain: "capabilities" | "locators", language: "typescript" | "javascript" | "python" | "java" | "csharp" })`.

Universal quality invariants and execution rules are accessible via `sdet://guidelines` and `sdet://invariants`.

## 7. Verification Checklist

- [ ] Zero assertions placed inside Page Objects.
- [ ] Thread-safe driver management (`ThreadLocal` / fixture scoping).
- [ ] Clean lifecycle teardown without orphaned browser processes.
- [ ] Validated via `verify_test_artifact({ code, framework, language })` with 100/100 score.
