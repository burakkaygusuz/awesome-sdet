# Awesome SDET — Agent Plugin 🚀

Enterprise SDET Agent Plugin for AI coding assistants featuring test automation skills and a secure Model Context Protocol (MCP) server.

Compliant with the [Agent Plugins Specification (v1.0.0)](https://agent-plugins.org/specification) and [MCP Specification (2026-07-28)](https://modelcontextprotocol.io/specification/2026-07-28).

---

## ⚡ Quick Start & Installation

Install `awesome-sdet` into your AI assistant of choice:

### 1. Claude Code

Add the plugin directly:

```bash
claude plugin add github:burakkaygusuz/awesome-sdet
```

Or add to your project's `.claude/settings.json`:

```json
{
  "plugins": ["github:burakkaygusuz/awesome-sdet"]
}
```

---

### 2. OpenCode

Install via the OpenCode CLI:

```bash
opencode plugin install github:burakkaygusuz/awesome-sdet
```

Or declare in `opencode.json`:

```json
{
  "$schema": "https://opencode.ai/schema.json",
  "plugins": ["github:burakkaygusuz/awesome-sdet"]
}
```

---

### 3. Cursor

Install via Cursor Plugins or clone into local plugins:

```bash
# Clone into Cursor local plugins
git clone https://github.com/burakkaygusuz/awesome-sdet.git ~/.cursor/plugins/local/awesome-sdet
```

Or configure the SDET MCP server in `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "sdet-mcp": {
      "command": "node",
      "args": ["<path-to-awesome-sdet>/servers/dist/index.js", "--stdio"]
    }
  }
}
```

---

### 4. VS Code & GitHub Copilot

Install from source via the Command Palette (`Chat: Install Plugin From Source`) with:

```text
https://github.com/burakkaygusuz/awesome-sdet.git
```

Or register the plugin path in `.vscode/settings.json`:

```json
{
  "chat.plugins.enabled": true,
  "chat.plugins.paths": {
    "<path-to-awesome-sdet>": true
  }
}
```

---

### 5. Codex & Antigravity (Workspace / Global Plugin)

Clone or add as submodule into your agent plugins directory:

```bash
# Workspace level
git clone https://github.com/burakkaygusuz/awesome-sdet.git .agents/plugins/awesome-sdet

# Global level
git clone https://github.com/burakkaygusuz/awesome-sdet.git ~/.gemini/config/plugins/awesome-sdet
```

---

## 📦 What's Included?

- **8 Canonical Capability-First Skills (`skills/sdet-*`):**
  - Universal SDET workflows, anti-pattern guides, and verification checklists following `agentskills.io` standards (`sdet-locators`, `sdet-actions`, `sdet-assertions`, `sdet-network`, `sdet-storage-state`, `sdet-observability`, `sdet-mobile`, and `sdet-authoring`).
  - Zero token bloat: Level 1 frontmatter, Level 2 lean rulebooks (<300 lines), and Level 3 on-demand polyglot delivery via MCP.
- **6 Host-Agnostic SDET Agents (`agents/`):**
  - Master SDET Orchestrator (`agents/sdet.agent.md`) supporting host-aware execution (subagent delegation vs. inline specialist persona adoption).
  - 5 Autonomous Domain Specialists for **Playwright**, **Cypress**, **Selenium 4**, **Vibium**, and **Appium**.
- **Enterprise SDET MCP Server (`servers/`):**
  - 5 Consolidated Framework Reference Tools (`read_pw_docs`, `read_se_docs`, `read_cy_docs`, `read_vibium_docs`, `read_appium_docs`) delivering progressive, section-filtered docs across 5 languages (TypeScript, JavaScript, Python, Java, C#).
  - **Deterministic Verification Engine (`verify_test_artifact`):** Real-time static invariant scanner enforcing zero-arbitrary-waits, meaningful assertions, accessible locators, and clean state isolation.
  - Strict **MCP 2026-07-28** conformance: Dual `stdio` and `streamable-http` transports.
  - Hardened security defenses: Loopback DNS rebinding prevention, 10MB payload limits, prototype pollution guards, safe error masking (`-32603`), and XML prompt boundary containment.
- **Deterministic Evals & Polyglot AST Validation (`evals/`):**
  - Fast, zero-API-cost offline evaluation benchmark suites covering framework routing, anti-pattern detection, and prompt injection containment.
  - Build-time tree-sitter AST validation guaranteeing syntax correctness for all documentation code blocks across 8 programming languages.

---

## 🛠️ Development & Validation

**Prerequisites:** Node.js `>=22.0.0`, pnpm `>=11.0.0`

```bash
# Install dependencies
pnpm install

# Build MCP server and TypeScript assets
pnpm run build

# Run TypeScript typecheck
pnpm run typecheck

# Run unit & live MCP matrix test suites (133 combinations)
pnpm test

# Run deterministic evaluation benchmark suites
pnpm run test:evals

# Validate Agent Plugin manifest, skills, and polyglot AST snippets
pnpm run validate

# Lint and format
pnpm run lint && pnpm run format:check

# Security audits
pnpm run audit:all
```

---

## 📄 License

MIT © [Burak Kaygusuz](https://github.com/burakkaygusuz)
