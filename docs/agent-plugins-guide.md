# Agent Plugins, Skills & MCP Server Engineering Guide

> A comprehensive technical guide for authoring, validating, and hardening **Agent Plugins 1.0.0**, **Skills**, and **Model Context Protocol (MCP)** servers for AI Coding Assistants across multi-framework SDET automation platforms (**Selenium**, **Playwright**, **Cypress**, **Appium**).
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

1. [Agent Plugins 1.0.0 Manifest Specification](#1-agent-plugins-100-manifest-specification)
   - 1.1 [Root Plugin Manifest (`plugin.json`)](#11-root-plugin-manifest-pluginjson)
   - 1.2 [MCP Server Manifest (`mcp.json`)](#12-mcp-server-manifest-mcpjson)
   - 1.3 [Canonical Schemas & Normative URL Validation](#13-canonical-schemas--normative-url-validation)
2. [Skills Authoring & Three-Level Progressive Loading](#2-skills-authoring--three-level-progressive-loading)
   - 2.1 [The Three-Level Token Architecture](#21-the-three-level-token-architecture)
   - 2.2 [Writing High-Precision `description` Fields](#22-writing-high-precision-description-fields)
   - 2.3 [Keeping the `SKILL.md` Body Lean](#23-keeping-the-skillmd-body-lean)
   - 2.4 [Delegating Exhaustive Data to MCP & `references/`](#24-delegating-exhaustive-data-to-mcp--references)
3. [MCP Server Architecture & Hardening](#3-mcp-server-architecture--hardening)
   - 3.1 [Tool `title` vs. `description` Token Optimization](#31-tool-title-vs-description-token-optimization)
   - 3.2 [Structured Output & `outputSchema`](#32-structured-output--outputschema)
   - 3.3 [Input Validation & Asynchronous Zod Parsing (`parseAsync`)](#33-input-validation--asynchronous-zod-parsing-parseasync)
   - 3.4 [Tool Execution Errors (SEP-1303)](#34-tool-execution-errors-sep-1303)
   - 3.5 [Singleton `McpServer` & Transport Lifecycle Management](#35-singleton-mcpserver--transport-lifecycle-management)
   - 3.6 [Tool Annotations & Security Guards](#36-tool-annotations--security-guards)
   - 3.7 [Transport Security, DNS Rebinding & HTTP Headers](#37-transport-security-dns-rebinding--http-headers)
4. [Hybrid SDET Agent Architecture & Framework Specialization](#4-hybrid-sdet-agent-architecture--framework-specialization)
   - 4.1 [Master Orchestrator & Specialist Agent Topology](#41-master-orchestrator--specialist-agent-topology)
   - 4.2 [Subagent Delegation & Invocation Workflow](#42-subagent-delegation--invocation-workflow)
   - 4.3 [Universal Cross-Framework Migration Architecture](#43-universal-cross-framework-migration-architecture)
   - 4.4 [Universal Quality & Anti-Pattern Invariants](#44-universal-quality--anti-pattern-invariants)
5. [SOLID Codebase & Validation Pipeline](#5-solid-codebase--validation-pipeline)
   - 5.1 [Modular Validator Architecture](#51-modular-validator-architecture)
   - 5.2 [End-to-End Verification Pipeline](#52-end-to-end-verification-pipeline)
6. [Authoring Checklist](#6-authoring-checklist)

---

## 1. Agent Plugins 1.0.0 Manifest Specification

The **Agent Plugins 1.0.0** standard defines interoperable plugins for AI coding assistants and autonomous agents. An agent plugin bundles skills, prompts, and MCP servers into an auditable repository package.

### 1.1 Root Plugin Manifest (`plugin.json`)

The `plugin.json` file resides at the root of the repository and declares the plugin identity, author, version, and capabilities.

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

#### Normative Field Constraints:

- **`$schema`**: MUST point directly to `https://agent-plugins.org/schemas/1.0.0/plugin.schema.json`.
- **`name`**: Lowercase alphanumeric string between 1 and 64 characters, matching regex `^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$`. Consecutive hyphens (`--`) and dots (`..`) are strictly forbidden.
- **`version`**: Semantic versioning format `^\d+\.\d+\.\d+$`.
- **`author`**: MUST be a JSON Object containing `name`, optional `email` (`z.email()`), and optional `url` (`z.url()`). Bare string author names are invalid under Agent Plugins 1.0.0.
- **`license`**: Valid SPDX license identifier (e.g. `MIT`, `Apache-2.0`).
- **`keywords`**: Extensible array of topic strings representing the supported automation ecosystem.

---

### 1.2 MCP Server Manifest (`mcp.json`)

The `mcp.json` manifest configures Model Context Protocol endpoints provided by the plugin.

```json
{
  "$schema": "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
  "mcpServers": {
    "sdet-mcp": {
      "type": "streamable-http",
      "url": "http://127.0.0.1:3000/mcp",
      "description": "Model Context Protocol Server providing test automation tools, documentation references, and runtime execution."
    }
  }
}
```

#### Supported Transport Types:

- **`streamable-http`**: High-performance HTTP streaming transport with stateless request handling.
- **`stdio`**: Standard input/output process transport for local CLI tools.
- **`sse`**: Server-Sent Events transport.

---

### 1.3 Canonical Schemas & Normative URL Validation

Do not commit local schema copies or map local copies in IDE settings. Always reference official canonical URLs to guarantee compliance and ensure effortless upstream schema evolution.

---

## 2. Skills Authoring & Three-Level Progressive Loading

### 2.1 The Three-Level Token Architecture

Skills are organized hierarchically to protect the LLM context window while maintaining deep technical accuracy:

|    Level    | Content                                     | When Loaded                              | Token Cost Impact |
| :---------: | :------------------------------------------ | :--------------------------------------- | :---------------: |
| **Level 1** | `name` + `description` (Frontmatter)        | Included in system prompt on every turn  |    **Highest**    |
| **Level 2** | `SKILL.md` body                             | Loaded only when the skill triggers      |    **Medium**     |
| **Level 3** | `references/`, `scripts/`, `sdet-mcp` tools | Read on-demand when explicitly requested |    **Lowest**     |

```
skills/
├── selenium/
│   ├── actions-api/
│   │   ├── SKILL.md                 ← Level 2: Decision trees, gotchas, core patterns
│   │   └── references/              ← Level 3: Language implementations
│   │       ├── java.md
│   │       ├── python.md
│   │       └── typescript.md
└── cypress/
    └── querying-selectors/
        └── SKILL.md
```

---

### 2.2 Writing High-Precision `description` Fields

The `description` field is a **trigger signal**, not a tutorial. It instructs the LLM host **when** to activate the skill.

**Rules for Authoring Descriptions:**

1. **Answer the Activation Question:** Under what precise intent should this skill load?
2. **Be Trigger-Focused:** Use clear semantic keywords covering the domain (e.g. POM, explicit waits, Shadow DOM, iframe traversal).
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

### 2.3 Keeping the `SKILL.md` Body Lean

The `SKILL.md` body (Level 2) loads in full whenever the skill is triggered:

- **Body Length:** Keep under **500 lines**.
- **Table of Contents:** If the body exceeds **300 lines**, include a Table of Contents at the top.
- **Focus:** Emphasize conceptual guidance, decision criteria (when to pick approach A vs. B), and subtle gotchas.

---

### 2.4 Delegating Exhaustive Data to MCP & `references/`

Exhaustive lookup tables, full method dictionaries, and version matrix tables belong at Level 3. Delegate to `references/` or `sdet-mcp`:

```markdown
> **Complete Reference:** For language-specific syntax across Java, Python, TypeScript, C#, and Ruby, query the `sdet-mcp` tool `read_selenium_actions_docs` or view `references/<language>.md`.
```

---

## 3. MCP Server Architecture & Hardening

### 3.1 Tool `title` vs. `description` Token Optimization

The MCP specification defines distinct roles for tool labels and descriptions:

- **`title`**: Display label for client UI and user confirmation dialogs (e.g. `"Selenium Actions API Docs"`).
- **`description`**: Semantic guidance read by the LLM context window to determine tool dispatch (target ≤ 120 characters).

```typescript
server.registerTool('read_selenium_actions_docs', {
  title: 'Selenium Actions API Docs',
  description: 'Returns Actions API user interaction guides and multi-language code examples.',
  inputSchema: ActionsDocsSchema.shape,
  annotations: SAFE_READONLY_ANNOTATIONS,
});
```

---

### 3.2 Structured Output & `outputSchema`

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

### 3.3 Input Validation & Asynchronous Zod Parsing (`parseAsync`)

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

### 3.4 Tool Execution Errors (SEP-1303)

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

### 3.5 Singleton `McpServer` & Transport Lifecycle Management

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

### 3.6 Tool Annotations & Security Guards

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

### 3.7 Transport Security, DNS Rebinding & HTTP Headers

For loopback and network-accessible MCP HTTP servers:

1. **HTTP Security Headers:**
   - `X-Content-Type-Options: nosniff`
   - `X-Frame-Options: DENY`
   - `Referrer-Policy: no-referrer`
2. **DNS Rebinding Protection:** Validate incoming `Host` and `Origin` headers against allowed domains (`localhost`, `127.0.0.1`).
3. **Error Scrubbing:** Never leak internal stack traces or database connection strings in HTTP 500 responses.

---

## 4. Hybrid SDET Agent Architecture & Framework Specialization

### 4.1 Master Orchestrator & Specialist Agent Topology

To achieve clean separation of concerns without sacrificing cross-framework migration capabilities, `awesome-sdet` employs an extensible **Universal Hybrid Architecture**:

```
                                      [ User / AI Host ]
                                             │
                         ┌───────────────────┴───────────────────┐
                         ▼                                       ▼
                 [ sdet Orchestrator ]                [ Direct Specialist Call ]
            (Strategy, Router & Migration)               (@<framework-specialist>)
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
                 • skills/<framework>/ (Level 1/2 Knowledge)
                 • sdet-mcp runtime tools (Level 3 API Execution)
```

1. **`sdet` (Master Orchestrator Agent):**
   - Coordinates multi-framework testing strategies and architectural decisions.
   - Manages cross-framework test migrations across all supported paradigms.
   - Delegates domain-specific test authoring to specialized subagents via `invoke_subagent`.

2. **Specialized Framework Agents:**
   - Autonomous, domain-isolated agents residing in `agents/<domain>/<framework>.agent.md`.
   - Adhere strictly to their framework's execution mechanics and query dedicated `sdet-mcp` tools.
   - Self-contained and independently extensible (e.g. web, mobile, performance, API).

---

### 4.2 Subagent Delegation & Invocation Workflow

When complex tasks require deep domain focus, the master orchestrator dynamically discovers and delegates to specialized subagents:

```markdown
1. User: "Refactor this legacy test suite to a modern TypeScript implementation with network stubs."
2. sdet orchestrator:
   - Analyzes test structure, locators, assertions, and execution model.
   - Invokes target specialist subagent with exact migration targets.
3. specialist subagent:
   - Replaces source calls with target idiomatic chains and constructs.
   - Enforces target execution constraints and non-blocking mechanics.
4. Output is verified and returned cleanly to the user.
```

---

### 4.3 Universal Cross-Framework Migration Architecture

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

### 4.4 Universal Quality & Anti-Pattern Invariants

To prevent code degradation, every framework agent enforces strict negative rules:

| Automation Domain            | Strictly Prohibited Anti-Patterns                                                                            | Required Best Practice                                                                          |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| **Browser & Web Drivers**    | `Thread.sleep(ms)`, raw locators without explicit waits, mutable static driver instances in parallel suites. | Use explicit waits with dynamic conditions, thread-local driver isolation, and W3C BiDi events. |
| **Command Queues (Chained)** | `async/await` inside test bodies, arbitrary sleep commands, assigning return values to `const`.              | Use retryable assertions, aliased network interceptions, and subject closures.                  |
| **Async Web / Performance**  | Arbitrary pause commands, non-awaited asynchronous actions, unmetered virtual user loops.                    | Rely on built-in auto-waiting, web-first assertions, and throughput pacing.                     |

---

## 5. SOLID Codebase & Validation Pipeline

### 5.1 Modular Validator Architecture

Validators adhere strictly to the **Single Responsibility Principle (SRP)**:

```
scripts/
├── schemas.ts                     # Data contracts (Zod schemas: z.email(), z.url())
├── validate.ts                    # Main orchestrator & dist/skills-manifest.json builder
└── validators/
    ├── plugin-validator.ts        # Validates plugin.json
    ├── mcp-validator.ts           # Validates mcp.json
    └── skills-validator.ts        # Validates skills/**/SKILL.md frontmatter & content
```

---

### 5.2 End-to-End Verification Pipeline

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

## 6. Authoring Checklist

When adding or updating skills, manifests, or tools, ensure all criteria pass:

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
☐ Exhaustive code tables delegated to references/ or sdet-mcp

Hybrid Agent Architecture
☐ sdet acts as master coordinator for migration and strategy
☐ selenium enforces W3C WebDriver, BiDi, and explicit waits (no Thread.sleep)
☐ cypress enforces command queues and cy.intercept (no async/await)

MCP Server Hardening
☐ Singleton McpServer reused across HTTP requests
☐ Transport cleaned up on res.on('close')
☐ Tool title separated from concise description (≤ 120 chars)
☐ ToolAnnotations (readOnlyHint, idempotentHint) declared on all tools
☐ Zod validation uses parseAsync or safeParseAsync
☐ Input errors returned as tool execution errors (SEP-1303)
```
