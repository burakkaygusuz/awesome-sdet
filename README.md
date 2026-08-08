# Awesome SDET

> Enterprise Agent Plugin & Model Context Protocol (MCP) Registry for Software Development Engineers in Test (SDET).

[![CI](https://img.shields.io/badge/CI-passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/burakkaygusuz/awesome-sdet/actions)
![Node](https://img.shields.io/badge/node-%3E%3D26.0.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![Agent Plugins](https://img.shields.io/badge/Agent_Plugins-1.0.0-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

---

## 📌 Overview

`awesome-sdet` is an enterprise-grade agent plugin compliant with the **Agent Plugins** specification and **Model Context Protocol (MCP)** ecosystem. Designed for AI coding assistants and autonomous agents (Claude Code, Cursor, AGY), it provides type-safe, multi-language, and multi-framework test automation tools and structured agentic skills.

For in-depth architectural specifications, authoring rules, and hardening standards, see the [Agent Plugins, Skills & MCP Server Engineering Guide](docs/agent-plugins-guide.md).

---

## 🏛️ Architecture

The repository is organized into modular layers that separate specification contracts, skill knowledge bases, runtime protocols, and validation logic:

- **Plugin & MCP Manifests**: Root metadata declarations configuring agent capabilities and MCP transports.
- **Skills Registry (`skills/`)**: Multi-framework SDET automation knowledge bases adhering to progressive token loading.
- **Model Context Protocol Servers (`servers/`)**: Hardened MCP runtime servers providing dynamic documentation tools and language references.
- **Validation Pipeline (`scripts/`)**: SOLID-compliant verification and manifest generation tools.
- **Engineering Documentation (`docs/`)**: Technical guides for plugin authors, maintainers, and security auditors.

---

## 🧩 Key Capabilities

- **Standardized Plugin Manifests**: Normative metadata declarations conforming to official canonical schemas.
- **Progressive Disclosure Skills**: Three-level architecture (Frontmatter triggers, core decision guidance, and on-demand reference material) designed to maximize token efficiency in LLM context windows.
- **Hardened MCP Services**: Stateless, non-blocking transport architectures with strict input validation, security annotations, and resilient error handling.
- **Extensible Test Automation Scope**: Multi-language, multi-framework automation coverage designed for enterprise SDET workflows.
- **Automated Verification Pipeline**: Integrated validation covering TypeScript type safety, manifest schema contracts, security audits, and unit testing.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js**: `>= 26.0.0`
- **pnpm**: `>= 10.0.0`

### Installation & Build

```bash
# Install workspace dependencies
pnpm install

# Build MCP servers and runtime assets
pnpm --dir servers build
```

---

## 🔍 Validation & Quality Pipeline

```bash
# 1. Typecheck TypeScript scripts
pnpm run typecheck

# 2. Validate Plugin, MCP, and Skill manifests
pnpm run validate

# 3. Format and lint checks
pnpm run format:check && pnpm run lint

# 4. Security audits for dependencies and skills
pnpm run audit && pnpm run audit:skills

# 5. Execute MCP Server test suite
pnpm --dir servers test
```

---

## 📜 License

MIT License © 2026 [Burak Kaygusuz](https://github.com/burakkaygusuz)
