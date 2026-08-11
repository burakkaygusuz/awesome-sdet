---
name: vibium-core-workflow
description: 'Master AI-native browser automation workflows with Vibium: sense-think-act loop, @ref mapping, differential state checks, CLI vs Native MCP vs SDK selection.'
user-invocable: true
license: MIT
compatibility: Vibium 26.x+
metadata:
  framework: vibium
  keywords:
    - vibium
    - sense-think-act
    - ref-mapping
    - differential-state
    - cli-sdk-mcp
    - daemon-lifecycle
---

# Vibium Core & Sense-Think-Act Workflow Architecture

## 1. What Is It?

Vibium Core is an AI-native browser automation framework built on the W3C WebDriver BiDi protocol, implementing an autonomous Sense-Think-Act execution loop with ephemeral `@ref` element mapping and zero-config browser lifecycle management.

## 2. Core Capabilities & Responsibilities

- **Sense-Think-Act Loop**: Navigates to pages, generates accessibility-derived element maps (`vibium map` / `browser_map`), and assigns stable `@e1`, `@e2` reference tags.
- **Differential State Tracking**: Detects post-action DOM mutations (`vibium diff map` / `browser_diff_map`) without re-parsing entire DOM trees.
- **Tri-Modal Interaction**: Supports headless CLI commands, JSON-RPC 2.0 stdio MCP server (`npx -y vibium mcp`), and polyglot SDKs (TypeScript, Python, Java).
- **Zero-Config Browser Lifecycle**: Automatically manages Chrome for Testing and Firefox binaries via a lightweight background daemon.

## 3. Why Use It?

Replaces heavyweight CDP wrappers and brittle HTTP-polling automation with standards-compliant bidirectional WebSocket communication, providing deterministic, fast element resolution tailored for AI coding agents.

## 4. Best Practices & Anti-Patterns

| Best Practice                                                                | Anti-Pattern                                                                  |
| :--------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| **Re-Map on Navigation**: Always issue a fresh `map` after page transitions. | **Stale Ref Reuse**: Reusing `@e1` across page reloads or route transitions.  |
| **Differential Validation**: Use `diff map` to confirm element mutations.    | **Arbitrary Sleep Loops**: Adding fixed sleep timers waiting for DOM updates. |
| **SDK in CI Pipelines**: Use programmatic SDKs for test regression suites.   | **Ad-hoc CLI in CI**: Running untyped bash command chains in enterprise CI.   |
| **Scoped Mapping**: Scope `map --selector` on large DOMs to conserve tokens. | **Unscoped Whole-Page Map**: Dumping huge page accessibility trees.           |

## 5. Dynamic Tool Schemas & API Reference

Retrieve language-specific code implementations and API schemas via `sdet-mcp`:

- **Tool**: `read_vibium_core_docs`
- **Parameters**: `language` (`typescript` | `javascript` | `python` | `java`)
- **Resource URI**: `vibium://core/{language}`
