# Awesome SDET

> Multi-Framework & Multi-Language Model Context Protocol (MCP) Servers & Agentic Skills Registry for Software Development Engineers in Test (SDET).

[![CI](https://img.shields.io/badge/CI-passing-brightgreen?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/burakkaygusuz/awesome-sdet/actions)
![Node](https://img.shields.io/badge/node-%3E%3D26.0.0-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-%3E%3D10.0.0-F69220?style=for-the-badge&logo=pnpm&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)

## 📌 Overview

`awesome-sdet` is an enterprise-grade registry providing **Stateless MCP Servers (`sdet-mcp`)** and structured **Agentic Skills** for modern Test Automation Engineering. Designed for AI agents (Claude Code, Cursor, AGY), it empowers teams to build type-safe, multi-language, and multi-framework test automation solutions across the software testing lifecycle.

## 🛠️ Repository Architecture

- **`servers/`**: Modular MCP server (`sdet-mcp`) built on `@modelcontextprotocol/sdk`. Uses a stateless HTTP transport (`StreamableHTTPServerTransport`), loopback security guards, and DRY error handling.
- **`skills/`**: Standardized SDET skills with metadata frontmatter (`name`, `description`, `keywords`) for AI agent consumption.

## 🚀 Quick Start

### Prerequisites

- **Node.js**: `>= 26.0.0`
- **pnpm**: `>= 10.0.0`

### Installation & Build

```bash
# Install workspace dependencies
pnpm install

# Build MCP server and static assets
pnpm --dir servers build
```

## 📜 License

MIT License © 2026 Burak Kaygusuz
