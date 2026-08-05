# MCP Server Hardening Guide

> Covers token efficiency, performance, and security hardening for the `sdet-mcp` Streamable HTTP server across any automation framework tools.

> Sources:
> [MCP Specification 2025-11-25](https://modelcontextprotocol.io/specification/2025-11-25),
> [MCP Security Best Practices](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/docs/tutorials/security/security_best_practices.mdx),
> [Tool Annotations](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/blog/content/posts/2026-03-16-tool-annotations.md)

---

## Table of Contents

1. [Token Efficiency](#1-token-efficiency)
   - 1.1 [Tool `title` vs. `description`](#11-tool-title-vs-description)
   - 1.2 [Structured Output via `outputSchema`](#12-structured-output-via-outputschema)
   - 1.3 [Input Validation Errors as Tool Errors (SEP-1303)](#13-input-validation-errors-as-tool-errors-sep-1303)
2. [Performance](#2-performance)
   - 2.1 [Singleton `McpServer` Instance](#21-singleton-mcpserver-instance)
   - 2.2 [Transport Lifecycle Management](#22-transport-lifecycle-management)
3. [Security](#3-security)
   - 3.1 [Tool Annotations](#31-tool-annotations)
   - 3.2 [Error Message Scrubbing](#32-error-message-scrubbing)
   - 3.3 [HTTP Security Headers](#33-http-security-headers)
   - 3.4 [DNS Rebinding & Host/Origin Validation](#34-dns-rebinding-hostorigin-validation)

---

## 1. Token Efficiency

LLM clients consume the full tool manifest (all tool names, descriptions, and input schemas) on every conversation turn. Keeping the manifest compact directly reduces prompt token usage.

### 1.1 Tool `title` vs. `description`

The MCP specification defines two separate human-readable fields for tools:

| Field         | Purpose                                                               | Consumed by                   |
| :------------ | :-------------------------------------------------------------------- | :---------------------------- |
| `title`       | Short, display-friendly label (e.g. `"SDET Locator Docs"`)            | MCP host UI, approval dialogs |
| `description` | Semantic description the LLM reads to decide whether to call the tool | LLM context window            |

Use `title` for the long readable name and keep `description` to **one sentence** focused on the tool's decision boundary.

```typescript
// ❌ Before — no title, verbose description
server.registerTool('read_sdet_locator_docs', {
  description:
    'Looks up complete SDET locator strategy guides, performance hierarchies, best practices, and multi-language code examples across test frameworks (Java, Python, TypeScript, JavaScript, C#, Ruby)',
  inputSchema: LocatorDocsSchema.shape,
});

// ✅ After — title + minimal description
server.registerTool('read_sdet_locator_docs', {
  title: 'SDET Locator Docs',
  description:
    'Returns locator strategy guide, performance hierarchy, and code examples for a given language.',
  inputSchema: LocatorDocsSchema.shape,
});
```

> **Rule of thumb:** If the description exceeds 120 characters, move the excess into `title` or trim it. Every extra token in the manifest multiplies across every LLM turn.

---

### 1.2 Structured Output via `outputSchema`

MCP 2025-11-25 introduced the `outputSchema` field and the corresponding `structuredContent` response field. When a tool declares an `outputSchema`:

- The response carries a **`structuredContent`** object alongside the legacy `content[].text` field.
- LLM clients that support structured output can read fields directly rather than parsing markdown prose.
- Clients **MUST** validate the `structuredContent` against the declared `outputSchema`.

**Tool definition** (server side):

```typescript
server.registerTool('read_sdet_locator_docs', {
  title: 'SDET Locator Docs',
  description: 'Returns locator strategy guide and code examples for a given language.',
  inputSchema: LocatorDocsSchema.shape,
  outputSchema: {
    type: 'object' as const,
    properties: {
      framework: { type: 'string', description: 'Requested framework identifier' },
      language: { type: 'string', description: 'Requested language identifier' },
      strategyHierarchy: {
        type: 'string',
        description: 'Markdown table of locator priority order',
      },
      codeExample: { type: 'string', description: 'Language-specific code example block' },
      bestPractices: { type: 'string', description: 'Best practice notes for the language' },
    },
    required: ['framework', 'language', 'codeExample'],
  },
});
```

**Tool handler** (structured response):

```typescript
// Return both content (legacy fallback) and structuredContent (new)
return {
  content: [{ type: 'text', text: markdown }], // kept for backward-compat clients
  structuredContent: {
    framework,
    language,
    strategyHierarchy,
    codeExample,
    bestPractices,
  },
};
```

> `structuredContent` is **optional** for the server to return but **required** to validate against `outputSchema` when present. Older clients that do not support `outputSchema` gracefully fall back to `content[].text`.

---

### 1.3 Input Validation Errors as Tool Errors (SEP-1303)

[SEP-1303](https://github.com/modelcontextprotocol/modelcontextprotocol/blob/main/docs/seps/1303-input-validation-errors-as-tool-execution-errors.mdx) recommends returning input validation failures as **tool execution errors** (`isError: true`) instead of JSON-RPC protocol errors (`code: -32602`). This places the error directly in the LLM context window, enabling self-correction without human intervention.

The current `safeToolHandler` already follows this pattern. Keep Zod error messages LLM-friendly:

```typescript
// ❌ Leaks Zod internals ("Invalid type at path[0].expected: string, received: number")
text: error.message;

// ✅ Concise, actionable feedback for the LLM
text: `Invalid argument: ${issue.path.join('.')} — ${issue.message}`;
```

---

## 2. Performance

### 2.1 Singleton `McpServer` Instance

The current implementation calls `createMcpServer()` inside `handleMcpPostRequest`, which allocates a new `McpServer` and registers all tools on every HTTP request.

Since `McpServer` is stateless and all tool handlers are pure functions, the server instance can be created **once at module load time**:

```typescript
// ❌ Before — new McpServer on every request (src/index.ts)
export async function handleMcpPostRequest(req, res, originHeader?) {
  const mcpServer = createMcpServer(); // ← allocates every call
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res);
}

// ✅ After — singleton server, per-request transport only
const mcpServer = createMcpServer(); // ← once at module level

export async function handleMcpPostRequest(req, res, originHeader?) {
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on('close', () => transport.close()); // ← always clean up
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res);
}
```

> `StreamableHTTPServerTransport` is inherently per-request when `sessionIdGenerator` is `undefined` (stateless mode). The transport must be created per-request; only the `McpServer` is safely shared.

---

### 2.2 Transport Lifecycle Management

Always attach a `close` listener on the response to guarantee transport cleanup, preventing potential handle leaks under error conditions:

```typescript
res.on('close', () => transport.close());
```

This mirrors the pattern used in the official MCP Apps example server and ensures the transport is closed even if the client disconnects mid-stream.

---

## 3. Security

### 3.1 Tool Annotations

The MCP specification defines `ToolAnnotations` as behavioral hints that MCP hosts use to make approval decisions **before** calling a tool. Server authors **SHOULD** declare annotations accurately on every tool.

```typescript
interface ToolAnnotations {
  title?: string;
  readOnlyHint?: boolean; // default: false — does the tool modify its environment?
  destructiveHint?: boolean; // default: true  — meaningful only when readOnlyHint is false
  idempotentHint?: boolean; // default: false — same args → same result, no cumulative effect
  openWorldHint?: boolean; // default: true  — does the tool reach external systems?
}
```

All `sdet-mcp` tools are read-only, idempotent, and operate in a closed world (local `.md` files):

```typescript
const SAFE_READONLY_ANNOTATIONS = {
  readOnlyHint: true, // no side effects
  destructiveHint: false, // implied by readOnlyHint, explicit for clarity
  idempotentHint: true, // same args always yield the same markdown
  openWorldHint: false, // serves only bundled reference files, no network calls
} satisfies import('@modelcontextprotocol/sdk/types.js').ToolAnnotations;

server.registerTool('read_sdet_locator_docs', {
  title: 'SDET Locator Docs',
  description: 'Returns locator strategy guide and code examples for a given language.',
  inputSchema: LocatorDocsSchema.shape,
  annotations: SAFE_READONLY_ANNOTATIONS,
});
```

---

### 3.2 Error Message Scrubbing

Scrub raw error details from transport-level responses to prevent internal topology leakage.

---

### 3.3 HTTP Security Headers

Add security response headers (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`) to HTTP responses.

---

### 3.4 DNS Rebinding & Host/Origin Validation

Enforce `Host` and `Origin` allowlists to prevent DNS rebinding attacks on loopback endpoints.

---

## Summary Checklist

| Area        | Action                                                             | Priority |
| :---------- | :----------------------------------------------------------------- | :------: |
| Token       | Add `title` to every `registerTool` call                           |  🟠 P1   |
| Token       | Shorten `description` to ≤ 120 characters                          |  🟠 P1   |
| Token       | Add `outputSchema` + return `structuredContent`                    |  🟡 P2   |
| Token       | Format validation errors as LLM-readable strings                   |  🟡 P2   |
| Performance | Move `createMcpServer()` to module scope (singleton)               |  🟠 P1   |
| Performance | Add `res.on('close', () => transport.close())`                     |  🟠 P1   |
| Security    | Add `ToolAnnotations` to all tools                                 |  🔴 P0   |
| Security    | Scrub `error.message` from transport-level catch                   |  🔴 P0   |
| Security    | Add `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy` |  🟡 P2   |
