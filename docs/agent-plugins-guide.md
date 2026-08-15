# Agent Plugins, Skills & MCP Server Engineering Guide

> A comprehensive technical guide for authoring, validating, and scaling **Agent Plugins 1.0.0**, **Agent Skills**, and **Model Context Protocol (MCP 2026-07-28)** servers across universal SDET automation ecosystems (Web, Mobile, API, Performance, and Contract testing).
>
> Normative References:
>
> - [Agent Plugins 1.0.0 Specification](https://agent-plugins.org/specification)
> - [Agent Plugins Manifest Schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json)
> - [Agent Plugins MCP Schema](https://agent-plugins.org/schemas/1.0.0/mcp.schema.json)
> - [Agent Skills Specification](https://agentskills.io/specification)
> - [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/2026-07-28)

---

## Table of Contents

1. [Canonical Architecture & Structural Taxonomy](#1-canonical-architecture--structural-taxonomy)
2. [Agent Plugins 1.0.0 Manifest Specification](#2-agent-plugins-100-manifest-specification)
3. [Agent Skills & Progressive Token Architecture](#3-agent-skills--progressive-token-architecture)
4. [MCP Server 2026-07-28 Runtime & Hardening](#4-mcp-server-2026-07-28-runtime--hardening)
5. [Hybrid SDET Orchestrator & Migration Engine](#5-hybrid-sdet-orchestrator--migration-engine)
6. [SOLID Verification Pipeline](#6-solid-verification-pipeline)
7. [Authoring Checklist](#7-authoring-checklist)

---

## 1. Canonical Architecture & Structural Taxonomy

The repository is architected as an **evergreen, multi-framework SDET platform**. It is designed to continuously incorporate new test automation paradigms (e.g. Web, Mobile, API, Performance, Contract, Visual, and Chaos testing) without requiring breaking changes to core manifests, routers, or validation rules.

### Structural Taxonomy Archetype

```
.
├── plugin.json                     # Root Agent Plugin manifest declaring universal SDET identity
├── mcp.json                        # MCP server manifest with dual stdio & streamable-http transports
├── skills/                         # Flat 1-level Agent Skills discovery root (MUST NOT nest subdirectories)
│   ├── sdet-<capability>/          # 8 Canonical Capability Skills (locators, actions, assertions, etc.)
│   │   └── SKILL.md                # Level 2: Decision matrices, universal invariants, anti-patterns
│   └── ...                         # Pure Level 1/2 rulebooks delegating Level 3 code to MCP
├── agents/                         # Hybrid SDET agent declarations
│   ├── sdet.agent.md               # Master orchestrator, strategy coordinator & cross-framework router
│   └── <specialty>/
│       └── <specialty>.agent.md    # Autonomous domain specialist agents (playwright, selenium, cypress, etc.)
├── servers/                        # Model Context Protocol server implementation (MCP 2026-07-28)
│   ├── src/
│   │   ├── index.ts                # Dual transport runtime (zero-config stdio & streamable-http with DoS/Rebinding guards)
│   │   ├── server.ts               # McpServer singleton registering Tools, Resources, and Prompts
│   │   ├── http/                   # Streamable HTTP wire layer (JSON-RPC parsing, request guards, transport security)
│   │   ├── resources/              # URI documentation resources (<protocol>://{domain}/{language})
│   │   ├── prompts/                # Standard SDET workflow prompts (generate-test, migrate-test)
│   │   └── domains/                # Pluggable framework domains (playwright, selenium, cypress, vibium, appium)
│   │       └── <domain>/           # Domain-isolated tools, schemas, and reference doc loaders
│   └── test/                       # Protocol, discovery, transport, and runtime test suites
├── scripts/                        # Automated CI verification & manifest builder pipeline
│   ├── schemas.ts                  # Strict data contracts with Spec §5.4 robustness
│   ├── validate.ts                 # Main orchestrator & dist/skills-manifest.json generator
│   └── validators/                 # Single-Responsibility modular validators
└── docs/                           # Architectural guides & technical specifications
```

---

## 2. Agent Plugins 1.0.0 Manifest Specification

The **Agent Plugins 1.0.0** standard defines interoperable plugins for AI coding assistants and autonomous agents. An agent plugin bundles skills, prompts, and MCP servers into an auditable repository package.

### 2.1 Root Plugin Manifest (`plugin.json`)

The `plugin.json` file resides at the root of the repository and declares the generic SDET plugin identity, author, version, and capabilities.

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json",
  "name": "awesome-sdet",
  "version": "1.0.0",
  "description": "Enterprise SDET Agent Plugin for AI coding assistants featuring test automation skills and a secure Model Context Protocol (MCP) server.",
  "author": {
    "name": "Burak Kaygusuz",
    "url": "https://github.com/burakkaygusuz"
  },
  "license": "MIT",
  "repository": "https://github.com/burakkaygusuz/awesome-sdet",
  "keywords": [
    "sdet",
    "test-automation",
    "e2e-testing",
    "playwright",
    "selenium",
    "cypress",
    "vibium",
    "appium",
    "mcp",
    "agent-plugin"
  ]
}
```

#### Normative Field Constraints

- **`$schema`**: MUST point directly to `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`.
- **`name`**: Lowercase alphanumeric string between 1 and 64 characters, matching regex `^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$`. Consecutive hyphens (`--`) and dots (`..`) are strictly forbidden.
- **`version`**: Semantic versioning format `^\d+\.\d+\.\d+$`.
- **`author`**: SHOULD be a JSON Object containing `name`, optional `email` (`z.email()`), and optional `url` (`z.url()`). Bare string author names are tolerated per the Spec §5.4 robustness principle (see §2.3) rather than rejected.
- **`license`**: Valid SPDX license identifier (e.g. `MIT`, `Apache-2.0`).
- **`keywords`**: Extensible array of topic strings representing the universal automation ecosystem.

---

### 2.2 MCP Server Manifest (`mcp.json`)

The `mcp.json` manifest configures Model Context Protocol endpoints provided by the plugin.

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "sdet-mcp": {
      "type": "stdio",
      "command": "node",
      "args": ["${PLUGIN_ROOT}/servers/dist/index.js", "--stdio"]
    },
    "sdet-mcp-http": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

#### Supported Transport Types & Zero-Config Execution

- **`stdio` (Primary)**: Spawns the MCP server on-demand as a local child process (`command: "node"`, `args: ["${PLUGIN_ROOT}/servers/dist/index.js", "--stdio"]`). AI coding assistants expand `${PLUGIN_ROOT}` to the filesystem-resolved plugin directory and run this out of the box with zero background server management.
- **`streamable-http`**: High-performance HTTP streaming transport (`url: "http://127.0.0.1:3000/mcp"`). Enables remote connections and distributed execution.
- **`sse`**: Server-Sent Events transport (`type`, `url`, optional `headers`).

---

### 2.3 Canonical Schemas & Validation Philosophy (Spec §5.4)

1. **Canonical Schema URLs:** Always reference official canonical schema URLs (`https://agent-plugins.org/schemas/1.0.0/*.json`) rather than local schema mirrors.
2. **Strict Property Rejection (`.strict()`):** All manifest schemas prohibit unrecognized top-level fields (`additionalProperties: false`). Manifests containing unknown keys (such as `description` inside an MCP server entry) MUST be rejected or skipped by spec-compliant clients.
3. **Spec §5.4 Robustness Principle:** Clients **MUST NOT** reject manifests solely because `version` is non-standard semver (e.g. `2026.08-beta`), `author` is a string vs. object, or `homepage`/`repository` are loose URIs. Validation should strictly enforce core invariants while remaining robust on informational metadata.

---

## 3. Agent Skills & Progressive Token Architecture

### 3.1 The Three-Level Token Architecture

Skills are organized hierarchically to protect the LLM context window while maintaining deep technical accuracy:

|    Level    | Content                                  | When Loaded                              | Token Cost Impact |
| :---------: | :--------------------------------------- | :--------------------------------------- | :---------------: |
| **Level 1** | `name` + `description` (Frontmatter)     | Included in system prompt on every turn  |    **Highest**    |
| **Level 2** | `SKILL.md` body                          | Loaded only when the skill triggers      |    **Medium**     |
| **Level 3** | `sdet-mcp` dynamic tools & URI resources | Read on-demand when explicitly requested |    **Lowest**     |

```markdown
skills/
├── sdet-locators/
│ └── SKILL.md ← Level 2: Universal accessibility invariants & paradigm mapping
├── sdet-actions/
│ └── SKILL.md ← Level 2: 6-point actionability verification pipelines
└── sdet-*/
└── SKILL.md ← Flat 1-level capability discovery (MUST NOT nest subdirectories)
```

---

### 3.2 Writing High-Precision `description` Fields

The `description` field is a **trigger signal**, not a tutorial. It instructs the LLM host **when** to activate the skill.

**Rules for Authoring Descriptions (per agentskills.io guidelines):**

1. **Imperative Phrasing:** Frame descriptions as instructions: `"Use this skill when..."` rather than passive statements.
2. **Focus on User Intent:** Describe what the user is trying to achieve (e.g. authoring resilient test selectors, migrating from XPath/CSS, intercepting network requests).
3. **No Domain/Framework Redundancy:** Do not repeat framework lists in the description when `metadata.frameworks` already declares them.
4. **Length Budget:** Keep descriptions concise (≤ 100 words, strictly under the 1024-character specification limit).
5. **Always Quote YAML Strings:** Use single quotes (`'...'`) in frontmatter to prevent YAML parse errors when colons or special characters appear.

```yaml
# ❌ Anti-pattern: Verbose listing repeating metadata
description: >
  Universal locators for Playwright, Cypress, Selenium, Vibium, and Appium with
  getByRole, getByLabel, and By.cssSelector.

# ✅ Recommended: Imperative, trigger-focused, intent-driven, and lean
description: 'Use this skill when authoring, querying, or refactoring UI element locators and selectors. Trigger when finding elements by accessible role or name, converting brittle XPath/CSS to semantic selectors, piercing Shadow DOM, or scoping within tables, lists, and modals.'
```

---

### 3.3 Keeping the `SKILL.md` Body Lean

The `SKILL.md` body (Level 2) loads in full whenever the skill is triggered:

- **Body Length:** Keep under **500 lines** (target < 100 lines for capability skills).
- **Table of Contents:** If the body exceeds **300 lines**, include a Table of Contents at the top.
- **Focus:** Emphasize conceptual guidance, universal invariants, decision criteria (when to pick approach A vs. B), and anti-pattern tables.

---

### 3.4 Delegating Exhaustive Multi-Language Code to MCP (Single Source of Truth)

Exhaustive lookup tables, full method dictionaries, and multi-language syntax belong at Level 3. In our architecture, `sdet-mcp` serves as the **Single Source of Truth (SSOT)** for polyglot code examples. `SKILL.md` delegates directly to `sdet-mcp` tools and dynamic resources:

```markdown
> **Complete Polyglot Reference:** To fetch language-specific code implementations without context pollution, invoke `sdet-mcp` tools (e.g. `read_pw_locators_docs({ language: 'python' })`) or read the corresponding dynamic Resource URI (e.g. `playwright://locators/python`).
```

---

## 4. MCP Server 2026-07-28 Runtime & Hardening

### 4.1 Tool `title` vs. `description` Token Optimization

The MCP specification defines distinct roles for tool labels and descriptions:

- **`title`**: Display label for client UI and user confirmation dialogs (e.g. `"Selenium Actions API Docs"`).
- **`description`**: Semantic guidance read by the LLM context window to determine tool dispatch (target ≤ 120 characters).

```typescript
server.registerTool('read_se_locator_docs', {
  title: 'Selenium Locator Strategy Docs',
  description:
    'Returns element location strategies, relative locators, and multi-language code examples.',
  inputSchema: LocatorDocsSchema,
  annotations: SAFE_READONLY_ANNOTATIONS,
});
```

---

### 4.2 Structured Output & `outputSchema`

MCP 2026-07-28 tools can declare an `outputSchema` alongside returning `structuredContent` (optional; the sdet-mcp docs tools currently return unstructured markdown via `content` only). Clients supporting structured outputs parse JSON fields directly without markdown regex extraction, falling back to `content[].text` for legacy clients:

```typescript
return {
  content: [{ type: 'text', text: markdown }],
  structuredContent: {
    framework,
    language,
    codeExample,
    bestPractices,
  },
};
```

---

### 4.3 Input Validation & Asynchronous Zod Parsing (`parseAsync`)

All tool arguments and manifest payloads must be validated using Zod. In asynchronous pipelines, use `await schema.parseAsync(input)`:

```typescript
import { z } from 'zod';

export const ToolArgsSchema = z.object({
  language: z
    .enum(['javascript', 'typescript', 'python', 'java', 'csharp', 'ruby'])
    .default('typescript'),
});

export async function validateToolArgs(raw: unknown) {
  return await ToolArgsSchema.parseAsync(raw);
}
```

---

### 4.4 Tool Execution Errors (SEP-1303)

Under [SEP-1303](https://github.com/modelcontextprotocol/modelcontextprotocol), input validation failures SHOULD be returned as **tool execution errors** (`isError: true`) instead of protocol JSON-RPC errors (`-32602`). This places actionable feedback in the LLM context for automatic self-correction.

```typescript
export function safeToolHandler(fn: () => ToolExecutionResult): ToolExecutionResult {
  try {
    return fn();
  } catch (err) {
    return {
      isError: true,
      content: [
        { type: 'text', text: `Error: ${err instanceof Error ? err.message : String(err)}` },
      ],
    };
  }
}
```

---

### 4.5 Singleton `McpServer` & Transport Lifecycle Management

In Streamable HTTP servers, allocate the `McpServer` instance once at module scope. The `StreamableHTTPServerTransport` is instantiated per request:

```typescript
const mcpServer = createMcpServer(); // Singleton instance

export async function handleMcpPostRequest(req: IncomingMessage, res: ServerResponse) {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => transport.close()); // Guaranteed cleanup
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, parsedBody);
}
```

---

### 4.6 Header-Based Routing & Desync Prevention (`Mcp-Method` & `Mcp-Name`)

Under the MCP 2026-07-28 stateless wire protocol, reverse proxies and API gateways rely on request headers for cache indexing, access control, and routing. To prevent gateway desynchronization and request smuggling:

1. **`Mcp-Method` Header Matching (Security Policy):** When the `Mcp-Method` header is present, the server verifies it matches `body.method`. Mismatches are rejected with HTTP 400 and JSON-RPC error code `-32020`.
2. **`Mcp-Name` Target Identifier Matching (Security Policy):** When `Mcp-Name` is present, it must match `params.name` (tools/prompts) or `params.uri` (resources). Mismatches are rejected with HTTP 400 and `-32020`.
3. **Protocol Version Validation (`Mcp-Protocol-Version`):** The server explicitly validates incoming protocol version headers against the supported modern version (`2026-07-28`), rejecting unsupported versions with HTTP 400, MCP error code `-32022` (`UnsupportedProtocolVersion`), and structured error payload containing `supported` and `requested` versions.

---

### 4.7 Stateless Streamable HTTP Transport & Security Hardening

The server provides unified endpoint handling across both network streaming and local CLI execution:

1. **Stateless Streamable HTTP (`POST /mcp`):** Conforming strictly to the MCP 2026-07-28 specification (_"Removal of the GET stream endpoint"_), Streamable HTTP operates exclusively via `POST` requests (and `OPTIONS` for CORS preflight). Unsupported methods like `GET` return `405 Method Not Allowed` with `Allow: POST, OPTIONS`.
2. **Zero-Config CLI Transport (`--stdio`):** Enables direct AI assistant spawning as a child process without background server management.
3. **HTTP Security Headers & DNS Rebinding:** Enforces `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, and strict `Host`/`Origin` loopback whitelisting (`localhost`, `127.0.0.1`, `[::1]`).

---

### 4.8 Zero-Backdoor Security Defenses & Resilient Boundaries

To guarantee an enterprise-grade, zero-vulnerability deployment, `sdet-mcp` implements defense-in-depth:

1. **Path Traversal Protection (`resolveSafePath`):** Dynamic reference file readers strictly resolve and boundary-check file paths inside the dedicated domain base directories. Any relative escape sequence (`../`), null-byte injection (`\0`), or root path escape is immediately rejected.
2. **10MB Ingestion Limit (`MAX_BODY_BYTES`):** Streaming request data and `Content-Length` headers are bounded at 10MB to prevent memory exhaustion and Denial of Service (DoS) attacks, returning `413 Payload Too Large`.
3. **Prototype Pollution Reviver:** JSON parsing uses `safeJsonParse()` with an internal reviver that strips `__proto__`, `constructor`, and `prototype` keys during deserialization.
4. **Internal Error Masking:** Unhandled exceptions catch and sanitize error output, returning standard `-32603 Internal error` payloads to clients without leaking sensitive stack traces or internal filesystem paths.
5. **Tool Annotations Immutability:** All registered tools declare frozen `SAFE_READONLY_ANNOTATIONS` (`readOnlyHint: true`, `destructiveHint: false`, `idempotentHint: true`, `openWorldHint: false`).

---

## 5. Hybrid SDET Orchestrator & Migration Engine

### 5.1 Master Orchestrator & Specialist Agent Topology

To achieve clean separation of concerns without sacrificing cross-framework migration capabilities, the plugin employs an extensible **Universal Hybrid Topology**:

```
                                      [ User / AI Host ]
                                             │
                         ┌───────────────────┴───────────────────┐
                         ▼                                       ▼
                 [ sdet Orchestrator ]                [ Direct Specialist Call ]
            (Strategy, Router & Migration)               (@<domain-specialist>)
                         │
     ┌───────────────────┼───────────────────┬───────────────────┐
     ▼                   ▼                   ▼                   ▼
[ Web & E2E ]       [ Mobile / Native ] [ API & Contract ]  [ Performance & Load ]
• Browser Drivers   • Device Drivers    • Request & Schema  • Virtual Users
• Command Queues    • Touch Gestures    • Mock Interception • Metrics & Telemetry
     │                   │                   │                   │
     └───────────────────┴─────────┬─────────┴───────────────────┘
                                   ▼
                 [ Dynamic Skill & MCP Tool Registry ]
                 • skills/<domain>-<topic>/ (Level 1/2 Knowledge)
                 • sdet-mcp runtime tools (Level 3 API Execution)
```

1. **`sdet` (Master Orchestrator Agent):**
   - Coordinates multi-framework testing strategies and architectural decisions.
   - Manages cross-framework test migrations across all supported paradigms.
   - Delegates domain-specific test authoring to specialized subagents via `invoke_subagent`.

2. **Specialized Framework & Domain Agents:**
   - Autonomous, domain-isolated agents residing in `agents/<specialty>/<specialty>.agent.md`.
   - Adhere strictly to their framework's execution mechanics and query dedicated `sdet-mcp` tools.
   - Self-contained and independently extensible (e.g. web, mobile, performance, API, contract).

---

### 5.2 Subagent Delegation & Invocation Workflow

When complex tasks require deep domain focus, the master orchestrator dynamically discovers and delegates to specialized subagents:

```markdown
1. User: "Refactor this legacy test suite to a modern test implementation with network stubs."
2. sdet orchestrator:
   - Analyzes test structure, locators, assertions, and execution model.
   - Invokes target specialist subagent with exact migration targets.
3. specialist subagent:
   - Replaces source calls with target idiomatic chains and constructs.
   - Enforces target execution constraints and non-blocking mechanics.
4. Output is verified and returned cleanly to the user.
```

---

### 5.3 Universal Cross-Framework Migration Architecture

When migrating test suites between different automation frameworks, map concepts using universal testing primitives:

| Universal Primitive       | Source Semantics                     | Target Translation Invariant       | Architectural Rationale                                           |
| :------------------------ | :----------------------------------- | :--------------------------------- | :---------------------------------------------------------------- |
| **Target Identification** | DOM locator / Accessibility ref      | Idiomatic target selector          | Use resilient accessibility or data attributes over brittle paths |
| **Action Execution**      | Synchronous or async action dispatch | Framework actionability check      | Verify visibility, attachment, and stability before firing events |
| **Synchronization**       | Polling loops / condition waiters    | Native dynamic assertion retry     | Replace arbitrary sleeps with condition-based assertion polling   |
| **Network Control**       | Wire interception / proxy route      | Native protocol stub / mock        | Intercept at network transport layer for deterministic data       |
| **Session & State**       | Cookie jar / token storage           | Isolated storage context / session | Cache authentication state to eliminate redundant UI logins       |
| **Execution Context**     | Thread / Process driver instance     | Isolated execution sandbox         | Maintain thread-safety and eliminate shared mutable state         |

---

### 5.4 Universal Quality & Anti-Pattern Invariants

To prevent code degradation, every framework agent enforces strict negative rules:

| Automation Domain             | Strictly Prohibited Anti-Patterns                                                                                            | Required Best Practice                                                                          |
| :---------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Event Loop (Playwright)**   | `page.waitForTimeout(ms)`, raw XPath/CSS when role exists, unconstrained `locator.first()` without scoping.                  | Use 6-point auto-waiting, accessibility locators (`getByRole`), `storageState` session caching. |
| **Browser & Web (Selenium)**  | `Thread.sleep(ms)`, raw locators without explicit waits, mutable static driver instances in parallel suites.                 | Use explicit waits with dynamic conditions, thread-local driver isolation, and W3C BiDi events. |
| **Command Queues (Cypress)**  | `async/await` inside test bodies, arbitrary sleep commands (`cy.wait(ms)`), assigning return values to `const`.              | Use retryable assertions, aliased network interceptions, and subject closures.                  |
| **AI-Native & BiDi (Vibium)** | Non-deterministic assertions, unconstrained vision loop retries without timeouts, brittle DOM selectors vs semantic intent.  | BiDi network event tapping, dynamic accessibility tree intent mapping, deterministic recording. |
| **Mobile & Native (Appium)**  | Deprecated TouchAction API, hardcoded device UDIDs, unhandled context switching (`NATIVE_APP`/`WEBVIEW`), unclosed sessions. | W3C PointerInput actions, mobile: command extensions, Screen Object Model, and AppiumBy.        |

---

## 6. SOLID Verification Pipeline

### 6.1 Modular Validator Architecture

Validators adhere strictly to the **Single Responsibility Principle (SRP)**:

```
scripts/
├── schemas.ts                     # Data contracts (Zod schemas: z.email(), z.url())
├── validate.ts                    # Main orchestrator & dist/skills-manifest.json builder
└── validators/
    ├── plugin-validator.ts        # Validates plugin.json
    ├── mcp-validator.ts           # Validates mcp.json
    └── skills-validator.ts        # Validates flat skills/*/SKILL.md non-recursively
```

---

### 6.2 End-to-End Verification Pipeline

Every contribution is validated through an automated CI suite:

```bash
# 1. Typecheck TypeScript scripts
pnpm run typecheck

# 2. Validate Plugin, MCP, and Skill manifests
pnpm run validate

# 3. Format and ESLint checks
pnpm run format:check && pnpm run lint

# 4. High-severity dependency & skill security audits
pnpm run audit && pnpm run audit:skills

# 5. Build and run complete Vitest test suites
pnpm test
```

---

## 7. Authoring Checklist

When adding or extending skills, manifests, or tools in the repository, ensure all criteria pass:

```markdown
Plugin & MCP Manifests
☐ plugin.json conforms to https://agent-plugins.org/schemas/1.0.0/plugin.schema.json
☐ author is a structured object { "name": "...", "url": "..." }
☐ mcp.json conforms to https://agent-plugins.org/schemas/1.0.0/mcp.schema.json and uses ${PLUGIN_ROOT}
☐ Canonical schema URLs used directly without local duplicate schemas

Skills Authoring
☐ Frontmatter contains name, description, user-invocable, license, metadata.frameworks
☐ description ≤ 100 words, quoted ("..."), trigger-accurate
☐ SKILL.md body < 500 lines (TOC included if > 300 lines)
☐ No forbidden freemium terminology
☐ Exhaustive code tables delegated to sdet-mcp or read-only Resources

Hybrid Agent Architecture
☐ sdet acts as master coordinator for migration and strategy
☐ Specialist agents encapsulate domain execution rules and constraints
☐ Direct 1-level skill discovery preserved (skills/<domain>-<topic>/SKILL.md)

MCP Server Hardening
☐ Singleton McpServer reused across HTTP requests
☐ Transport cleaned up on res.on('close')
☐ Tool title separated from concise description (≤ 120 chars)
☐ ToolAnnotations (readOnlyHint, idempotentHint) declared on all tools
☐ Zod validation uses parseAsync or safeParseAsync
☐ Input errors returned as tool execution errors (SEP-1303)
```
