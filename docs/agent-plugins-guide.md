# Agent Plugins, Skills & MCP Server Engineering Guide

> A comprehensive technical guide for authoring, validating, and scaling **Agent Plugins 1.0.0**, **Agent Skills**, and **Model Context Protocol (MCP 2026-07-28)** servers across universal SDET automation ecosystems (Web, Mobile, API, Performance, and Contract testing).
>
> Normative References:
>
> - [Agent Plugins 1.0.0 Specification](https://agent-plugins.org/specification)
> - [Agent Plugins Plugin Authors Guide](https://agent-plugins.org/plugin-authors)
> - [Agent Plugins Manifest Schema](https://agent-plugins.org/schemas/1.0.0/plugin.schema.json)
> - [Agent Plugins MCP Schema](https://agent-plugins.org/schemas/1.0.0/mcp.schema.json)
> - [Model Context Protocol Specification](https://modelcontextprotocol.io/specification/2026-07-28)
> - [Anthropic Skills: Three-Level Progressive Loading](https://github.com/anthropics/skills)

---

## Table of Contents

1. [Canonical Extensibility Architecture & Structural Taxonomy](#1-canonical-extensibility-architecture--structural-taxonomy)
2. [Agent Plugins 1.0.0 Manifest Specification](#2-agent-plugins-100-manifest-specification)
   - 2.1 [Root Plugin Manifest (`plugin.json`)](#21-root-plugin-manifest-pluginjson)
   - 2.2 [MCP Server Manifest (`mcp.json`)](#22-mcp-server-manifest-mcpjson)
   - 2.3 [Canonical Schemas & Validation Philosophy (Spec §5.4)](#23-canonical-schemas--validation-philosophy-spec-54)
3. [Skills Authoring & Three-Level Progressive Loading](#3-skills-authoring--three-level-progressive-loading)
   - 3.1 [The Three-Level Token Architecture](#31-the-three-level-token-architecture)
   - 3.2 [Writing High-Precision `description` Fields](#32-writing-high-precision-description-fields)
   - 3.3 [Keeping the `SKILL.md` Body Lean](#33-keeping-the-skillmd-body-lean)
   - 3.4 [Delegating Exhaustive Data to MCP & `references/`](#34-delegating-exhaustive-data-to-mcp--references)
4. [MCP Server Architecture & Hardening](#4-mcp-server-architecture--hardening)
   - 4.1 [Tool `title` vs. `description` Token Optimization](#41-tool-title-vs-description-token-optimization)
   - 4.2 [Structured Output & `outputSchema`](#42-structured-output--outputschema)
   - 4.3 [Input Validation & Asynchronous Zod Parsing (`parseAsync`)](#43-input-validation--asynchronous-zod-parsing-parseasync)
   - 4.4 [Tool Execution Errors (SEP-1303)](#44-tool-execution-errors-sep-1303)
   - 4.5 [Singleton `McpServer` & Transport Lifecycle Management](#45-singleton-mcpserver--transport-lifecycle-management)
   - 4.6 [Tool Annotations & Security Guards](#46-tool-annotations--security-guards)
   - 4.7 [Transport Security, DNS Rebinding & HTTP Headers](#47-transport-security-dns-rebinding--http-headers)
5. [Hybrid SDET Agent Architecture & Universal Extensibility](#5-hybrid-sdet-agent-architecture--universal-extensibility)
   - 5.1 [Master Orchestrator & Specialist Agent Topology](#51-master-orchestrator--specialist-agent-topology)
   - 5.2 [Subagent Delegation & Invocation Workflow](#52-subagent-delegation--invocation-workflow)
   - 5.3 [Universal Cross-Framework Migration Architecture](#53-universal-cross-framework-migration-architecture)
   - 5.4 [Universal Quality & Anti-Pattern Invariants](#54-universal-quality--anti-pattern-invariants)
6. [SOLID Codebase & Validation Pipeline](#6-solid-codebase--validation-pipeline)
   - 6.1 [Modular Validator Architecture](#61-modular-validator-architecture)
   - 6.2 [End-to-End Verification Pipeline](#62-end-to-end-verification-pipeline)
7. [Authoring Checklist](#7-authoring-checklist)

---

## 1. Canonical Extensibility Architecture & Structural Taxonomy

The repository is architected as an **evergreen, multi-framework SDET platform**. It is designed to continuously incorporate new test automation paradigms (e.g. Web, Mobile, API, Performance, Contract, Visual, and Chaos testing) without requiring breaking changes to core manifests, routers, or validation rules.

### Structural Taxonomy Archetype

```
.
├── plugin.json                     # Root Agent Plugin manifest declaring universal SDET identity
├── mcp.json                        # MCP server manifest with dual stdio & streamable-http transports
├── skills/                         # Flat 1-level Agent Skills discovery root (MUST NOT nest subdirectories)
│   ├── <ecosystem-or-domain>-<topic>/
│   │   └── SKILL.md                # Level 2: Decision matrices, anti-patterns, gotchas
│   └── ...                         # Any new automation framework or domain plugs in directly here
├── agents/                         # Hybrid SDET agent declarations
│   ├── sdet.agent.md               # Master orchestrator, strategy coordinator & cross-framework router
│   └── <specialty>/
│       └── <specialty>.agent.md    # Autonomous domain specialist agents
├── servers/                        # Model Context Protocol server implementation (MCP 2026-07-28)
│   ├── src/
│   │   ├── index.ts                # Dual transport runtime (zero-config stdio & streamable-http)
│   │   ├── server.ts               # McpServer singleton registering Tools, Resources, and Prompts
│   │   ├── resources/              # URI documentation resources (<protocol>://{domain}/{language})
│   │   ├── prompts/                # Standard SDET workflow prompts (generate-test, migrate-test)
│   │   └── <domain>/               # Domain-isolated tools, schemas, and reference doc loaders
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
    "api-testing",
    "performance-testing",
    "mobile-testing",
    "mcp",
    "agent-plugin",
    "ai-agent"
  ]
}
```

#### Normative Field Constraints

- **`$schema`**: MUST point directly to `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`.
- **`name`**: Lowercase alphanumeric string between 1 and 64 characters, matching regex `^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$`. Consecutive hyphens (`--`) and dots (`..`) are strictly forbidden.
- **`version`**: Semantic versioning format `^\d+\.\d+\.\d+$`.
- **`author`**: MUST be a JSON Object containing `name`, optional `email` (`z.email()`), and optional `url` (`z.url()`). Bare string author names are invalid under Agent Plugins 1.0.0.
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
      "args": ["servers/dist/index.js", "--stdio"]
    },
    "sdet-mcp-http": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:3000/mcp"
    }
  }
}
```

#### Supported Transport Types & Zero-Config Execution

- **`stdio` (Primary)**: Spawns the MCP server on-demand as a local child process (`command: "node"`, `args: ["servers/dist/index.js", "--stdio"]`). AI coding assistants run this out of the box with zero background server management.
- **`streamable-http`**: High-performance HTTP streaming transport (`url: "http://127.0.0.1:3000/mcp"`). Enables remote connections and distributed execution.
- **`sse`**: Server-Sent Events transport (`type`, `url`, optional `headers`).

---

### 2.3 Canonical Schemas & Validation Philosophy (Spec §5.4)

1. **Canonical Schema URLs:** Always reference official canonical schema URLs (`https://agent-plugins.org/schemas/1.0.0/*.json`) rather than local schema mirrors.
2. **Strict Property Rejection (`.strict()`):** All manifest schemas prohibit unrecognized top-level fields (`additionalProperties: false`). Manifests containing unknown keys (such as `description` inside an MCP server entry) MUST be rejected or skipped by spec-compliant clients.
3. **Spec §5.4 Robustness Principle:** Clients **MUST NOT** reject manifests solely because `version` is non-standard semver (e.g. `2026.08-beta`), `author` is a string vs. object, or `homepage`/`repository` are loose URIs. Validation should strictly enforce core invariants while remaining robust on informational metadata.

---

## 3. Skills Authoring & Three-Level Progressive Loading

### 3.1 The Three-Level Token Architecture

Skills are organized hierarchically to protect the LLM context window while maintaining deep technical accuracy:

|    Level    | Content                                     | When Loaded                              | Token Cost Impact |
| :---------: | :------------------------------------------ | :--------------------------------------- | :---------------: |
| **Level 1** | `name` + `description` (Frontmatter)        | Included in system prompt on every turn  |    **Highest**    |
| **Level 2** | `SKILL.md` body                             | Loaded only when the skill triggers      |    **Medium**     |
| **Level 3** | `references/`, `scripts/`, `sdet-mcp` tools | Read on-demand when explicitly requested |    **Lowest**     |

```markdown
skills/
├── <domain-or-framework>-<feature>/
│ └── SKILL.md ← Level 2: Core architectural patterns & decision trees
└── <domain-or-framework>-<topic>/
└── SKILL.md ← Level 2: Direct 1-level discovery (MUST NOT be nested)
```

---

### 3.2 Writing High-Precision `description` Fields

The `description` field is a **trigger signal**, not a tutorial. It instructs the LLM host **when** to activate the skill.

**Rules for Authoring Descriptions:**

1. **Answer the Activation Question:** Under what precise intent should this skill load?
2. **Be Trigger-Focused:** Use clear semantic keywords covering the domain (e.g. POM, explicit waits, Shadow DOM, network stubs, load testing, contract verification).
3. **No Inline API Dumps:** Never list method signatures or class tables in the description.
4. **Length Budget:** Keep descriptions concise (≤ 100 words).
5. **Always Quote YAML Strings:** Use double quotes (`"..."`) or single quotes (`'...'`) in frontmatter to prevent YAML parse errors when colons appear in sentences.

```yaml
# ❌ Anti-pattern: Verbose class listing bloats Level 1
description: >
  Page Object Model POM with PageFactory.initElements, @FindBy, By.cssSelector,
  driver.findElement, and WebDriverWait for Java, Python, and CSharp.

# ✅ Recommended: Trigger-focused, lean, and quoted
description: 'Master Page Object Model (POM) design patterns, component objects, and action bots across test automation frameworks.'
```

---

### 3.3 Keeping the `SKILL.md` Body Lean

The `SKILL.md` body (Level 2) loads in full whenever the skill is triggered:

- **Body Length:** Keep under **500 lines**.
- **Table of Contents:** If the body exceeds **300 lines**, include a Table of Contents at the top.
- **Focus:** Emphasize conceptual guidance, decision criteria (when to pick approach A vs. B), and subtle gotchas.

---

### 3.4 Delegating Exhaustive Data to MCP & `references/`

Exhaustive lookup tables, full method dictionaries, and multi-language syntax belong at Level 3. Delegate to `sdet-mcp` tools or read-only Resources:

```markdown
> **Complete Reference:** For language-specific syntax across multiple languages, query the `sdet-mcp` tool `read_<domain>_*` or read the corresponding `sdet://` or `<domain>://` Resource.
```

---

## 4. MCP Server Architecture & Hardening

### 4.1 Tool `title` vs. `description` Token Optimization

The MCP specification defines distinct roles for tool labels and descriptions:

- **`title`**: Display label for client UI and user confirmation dialogs (e.g. `"Selenium Actions API Docs"`).
- **`description`**: Semantic guidance read by the LLM context window to determine tool dispatch (target ≤ 120 characters).

```typescript
server.registerTool('read_se_locator_docs', {
  title: 'Selenium Locator Strategy Docs',
  description:
    'Returns element location strategies, relative locators, and multi-language code examples.',
  inputSchema: LocatorDocsSchema.shape,
  annotations: SAFE_READONLY_ANNOTATIONS,
});
```

---

### 4.2 Structured Output & `outputSchema`

MCP 2026-07-28 tools can declare an `outputSchema` alongside returning `structuredContent`. Clients supporting structured outputs parse JSON fields directly without markdown regex extraction, falling back to `content[].text` for legacy clients:

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

In Streamable HTTP servers, allocate the `McpServer` instance once at module scope. Only the `StreamableHTTPServerTransport` is instantiated per request:

```typescript
const mcpServer = createMcpServer(); // Singleton instance

export async function handleMcpPostRequest(req: IncomingMessage, res: ServerResponse) {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => transport.close()); // Guaranteed cleanup
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res);
}
```

---

### 4.6 Tool Annotations & Security Guards

Declare security annotations on all read-only documentation tools:

```typescript
export const SAFE_READONLY_ANNOTATIONS = {
  readOnlyHint: true, // Tool produces zero environmental mutations
  destructiveHint: false, // Non-destructive
  idempotentHint: true, // Same parameters yield identical results
  openWorldHint: false, // Operates strictly on bundled local documentation
} as const;
```

---

### 4.7 Transport Security, DNS Rebinding & HTTP Headers

For loopback and network-accessible MCP HTTP servers:

1. **HTTP Security Headers:**
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: no-referrer`
2. **DNS Rebinding Protection:** Validate incoming `Host` and `Origin` headers against allowed domains (`localhost`, `127.0.0.1`).
3. **Error Scrubbing:** Never leak internal stack traces or database connection strings in HTTP 500 responses.

---

## 5. Hybrid SDET Agent Architecture & Universal Extensibility

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

| Automation Domain            | Strictly Prohibited Anti-Patterns                                                                            | Required Best Practice                                                                          |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Browser & Web Drivers**    | `Thread.sleep(ms)`, raw locators without explicit waits, mutable static driver instances in parallel suites. | Use explicit waits with dynamic conditions, thread-local driver isolation, and W3C BiDi events. |
| **Command Queues (Chained)** | `async/await` inside test bodies, arbitrary sleep commands, assigning return values to `const`.              | Use retryable assertions, aliased network interceptions, and subject closures.                  |
| **Async Web / Performance**  | Arbitrary pause commands, non-awaited asynchronous actions, unmetered virtual user loops.                    | Rely on built-in auto-waiting, web-first assertions, and throughput pacing.                     |

---

## 6. SOLID Codebase & Validation Pipeline

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

# 5. MCP Server build and Vitest suite
pnpm --dir servers test
```

---

## 7. Authoring Checklist

When adding or extending skills, manifests, or tools in the repository, ensure all criteria pass:

```markdown
Plugin & MCP Manifests
☐ plugin.json conforms to https://agent-plugins.org/schemas/1.0.0/plugin.schema.json
☐ author is a structured object { "name": "...", "url": "..." }
☐ mcp.json conforms to https://agent-plugins.org/schemas/1.0.0/mcp.schema.json
☐ Canonical schema URLs used directly without local duplicate schemas

Skills Authoring
☐ Frontmatter contains name, description, user-invocable, license, metadata.framework
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
