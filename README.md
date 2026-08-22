# Awesome SDET — Agent Plugin

Enterprise SDET Agent Plugin & MCP Server featuring deterministic AST test verification and policy-bounded repair.

Compliant with the [Agent Plugins Specification (v1.0.0)](https://agent-plugins.org/specification) and [MCP Specification (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28).

---

## Quick Start & Installation

Install `awesome-sdet` into your AI assistant or agentic coding environment:

| Platform / Host         | Installation Method                                                                         |
| :---------------------- | :------------------------------------------------------------------------------------------ |
| **Claude Code**         | `/plugin marketplace add burakkaygusuz/awesome-sdet` then `/plugin install awesome-sdet`    |
| **OpenCode**            | Declare `"plugin": ["github:burakkaygusuz/awesome-sdet"]` in `opencode.json`                |
| **VS Code & Copilot**   | Register path in `.vscode/settings.json` (`"chat.plugins.paths"`) or Command Palette        |
| **Antigravity & Codex** | Clone to `.agents/plugins/awesome-sdet` (workspace) or `~/.gemini/config/plugins/` (global) |

---

## What's Included?

- **8 Canonical Capability-First Skills (`skills/sdet-*`):**
  - Universal SDET workflows, anti-pattern guides, and verification checklists following `agentskills.io` standards (`sdet-locators`, `sdet-actions`, `sdet-assertions`, `sdet-network`, `sdet-storage-state`, `sdet-observability`, `sdet-mobile`, and `sdet-authoring`).
  - Zero token bloat: Level 1 frontmatter, Level 2 lean rulebooks (<300 lines), and Level 3 on-demand polyglot delivery via MCP.
- **6 Host-Agnostic SDET Agents (`agents/`):**
  - Master SDET Orchestrator (`agents/sdet.agent.md`) supporting host-aware execution (subagent delegation vs. inline specialist persona adoption).
  - 5 Autonomous Domain Specialists for **Playwright**, **Cypress**, **Selenium 4**, **Vibium**, and **Appium**.
- **Enterprise SDET MCP Server (`servers/`):**
  - **Universal SDET Docs Gateway (`read_sdet_docs`):** Single high-performance documentation gateway dynamically delivering progressive, section-filtered docs across all supported frameworks (Playwright, Cypress, Selenium, Vibium, Appium) and 5 languages (TypeScript, JavaScript, Python, Java, C#) with an $O(1)$ tool footprint.
  - **Deterministic Verification Engine (`verify_test_artifact`):** Real-time static invariant scanner enforcing zero-arbitrary-waits, meaningful assertions, accessible locators, and clean state isolation.
  - Strict **MCP 2026-07-28** conformance: Dual `stdio` and `streamable-http` transports.
  - Hardened security defenses: Loopback DNS rebinding prevention, 10MB payload limits, prototype pollution guards, safe error masking (`-32603`), and XML prompt boundary containment.
- **Deterministic Evals & Polyglot AST Validation (`evals/`):**
  - Fast, zero-API-cost offline evaluation benchmark suites covering framework routing, anti-pattern detection, and prompt injection containment.
  - Build-time tree-sitter AST validation guaranteeing syntax correctness for all documentation code blocks across 8 programming languages.

---

## Development & Validation

**Prerequisites:** Node.js `>=22.0.0`, pnpm `>=11.0.0`

```bash
# Install dependencies
pnpm install

# Build MCP server and TypeScript assets
pnpm run build

# Run TypeScript typecheck
pnpm run typecheck

# Run unit, protocol, and runtime test suites
pnpm test

# Run deterministic evaluation benchmark suites
pnpm run test:evals

# Validate Agent Plugin manifest, skills, and polyglot AST snippets
pnpm run validate

# Lint and format
pnpm run lint && pnpm run format:check

# Security audit
pnpm run audit
```

---

## License

MIT [Burak Kaygusuz](https://github.com/burakkaygusuz)
