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

### 3. Codex & Antigravity (Workspace / Global Plugin)

Clone or add as submodule into your agent plugins directory:

```bash
# Workspace level
git clone https://github.com/burakkaygusuz/awesome-sdet.git .agents/plugins/awesome-sdet

# Global level
git clone https://github.com/burakkaygusuz/awesome-sdet.git ~/.gemini/config/plugins/awesome-sdet
```

---

### 4. Cursor / VS Code (Manual MCP Configuration)

Add the MCP server to your `mcpSettings.json` or `.cursor/mcp.json`:

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

## 📦 What's Included?

- **32 Test Automation Skills (`skills/`):**
  - **Cypress (11 skills):** Web E2E, Component testing, Network interception & performance.
  - **Selenium (11 skills):** WebDriver BiDi, Grid distribution, session management.
  - **Vibium (5 skills):** AI-native Sense-Think-Act automation.
  - **Appium (5 skills):** Native iOS & Android testing.
- **5 SDET Agents (`agents/`):**
  - Specialized agent definitions for SDET generalist, Cypress, Selenium, Vibium, and Appium.
- **SDET MCP Server (`mcp.json` / `servers/`):**
  - Out-of-the-box test plan validation, test code linting, framework matrix recommendations.
  - Dual transports: On-demand `stdio` subprocess execution and high-performance `streamable-http` endpoint (`http://127.0.0.1:3000/mcp`).
- **Universal Directives (`AGENTS.md`):**
  - Shift-left testing, deterministic synchronization, zero-flakiness rules.

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
