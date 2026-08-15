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
  - Universal SDET rules and decision trees following `agentskills.io` standards (`sdet-locators`, `sdet-actions`, `sdet-assertions`, `sdet-network`, `sdet-storage-state`, `sdet-observability`, `sdet-mobile`, and `sdet-authoring`).
  - Zero token bloat: Level 1 frontmatter, Level 2 lean rulebooks, and Level 3 on-demand polyglot delivery via MCP.
- **6 SDET Agents (`agents/`):**
  - Master SDET Orchestrator (`agents/sdet.agent.md`) for cross-framework test strategy, migration, and subagent routing.
  - 5 Autonomous Domain Specialists for **Playwright**, **Cypress**, **Selenium 4**, **Vibium**, and **Appium**.
- **Enterprise SDET MCP Server (`mcp.json` / `servers/`):**
  - 32 MCP tools and dynamic resource templates (`playwright://`, `selenium://`, `cypress://`, `vibium://`, `appium://`) as the Single Source of Truth for polyglot code examples.
  - Strict **MCP 2026-07-28** conformance: Dual `stdio` and `streamable-http` transports.
  - Zero-backdoor security defenses: Loopback DNS rebinding prevention, 10MB payload limit (DoS protection), prototype pollution prevention, safe error masking (`-32603`), and path-traversal guards (`resolveSafePath`).
- **Universal Directives (`AGENTS.md`):**
  - Shift-left state & isolation, deterministic synchronization, zero-flakiness rules.

---

## 🛠️ Development & Validation

```bash
# Install dependencies
pnpm install

# Build MCP server and TypeScript assets
pnpm run build

# Run TypeScript typecheck
pnpm run typecheck

# Run test suites (Manifests, MCP protocol & tool primitives)
pnpm test

# Validate Agent Plugin manifest and skills
pnpm run validate

# Lint and format
pnpm run lint
pnpm run format:check

# Security audits
pnpm run audit:all
```

---

## 📄 License

MIT © [Burak Kaygusuz](https://github.com/burakkaygusuz)
