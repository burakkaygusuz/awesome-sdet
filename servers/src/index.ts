import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer, PROTOCOL_VERSION_2026_07_28 } from './server.js';

export const rawPort = process.env.PORT || '3000';
export const PORT = Number.parseInt(rawPort, 10);
export const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export const SUPPORTED_PROTOCOL_VERSIONS = new Set([
  PROTOCOL_VERSION_2026_07_28,
  '2025-11-25',
  '2024-11-05',
]);

export const mcpServer = createMcpServer();

export interface HostAndOriginInfo {
  hostName: string;
  originHeader?: string;
  originName?: string;
}

export function extractHostAndOrigin(req: http.IncomingMessage): HostAndOriginInfo {
  const hostHeader = req.headers.host || '';
  const hostName = hostHeader.startsWith('[::1]') ? '[::1]' : hostHeader.split(':')[0];

  const originHeader = req.headers.origin;
  let originName: string | undefined;
  if (originHeader) {
    try {
      originName = new URL(originHeader).hostname;
    } catch {
      // ignore parsing errors
    }
  }

  return { hostName, originHeader, originName };
}

export function isLocalHostAndOrigin(req: http.IncomingMessage): boolean {
  const { hostName, originHeader, originName } = extractHostAndOrigin(req);
  if (!ALLOWED_HOSTS.has(hostName)) return false;
  if (originHeader && originName && !ALLOWED_HOSTS.has(originName)) return false;
  return true;
}

export function handleCorsPreflight(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  originHeader?: string
): boolean {
  if (req.method !== 'OPTIONS') return false;

  res.writeHead(204, {
    'Access-Control-Allow-Origin': originHeader || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, Mcp-Method, Mcp-Name, Mcp-Protocol-Version',
    'Access-Control-Max-Age': '86400',
  });
  res.end();
  return true;
}

export function extractBodyProtocolVersion(payload: Record<string, unknown>): string | undefined {
  if (!payload || typeof payload !== 'object') return undefined;

  const params = payload.params as Record<string, unknown> | undefined;
  if (params && typeof params === 'object') {
    const meta = params._meta as Record<string, unknown> | undefined;
    if (meta && typeof meta === 'object') {
      const v = (meta['io.modelcontextprotocol/protocolVersion'] || meta.protocolVersion) as
        string | undefined;
      if (typeof v === 'string') return v.trim();
    }
    if (typeof params.protocolVersion === 'string') {
      return params.protocolVersion.trim();
    }
  }

  const rootMeta = payload._meta as Record<string, unknown> | undefined;
  if (rootMeta && typeof rootMeta === 'object') {
    const v = (rootMeta['io.modelcontextprotocol/protocolVersion'] || rootMeta.protocolVersion) as
      string | undefined;
    if (typeof v === 'string') return v.trim();
  }

  return undefined;
}

export async function handleMcpPostRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  originHeader?: string
): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', originHeader || '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Mcp-Method, Mcp-Name, Mcp-Protocol-Version'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');

  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      let jsonPayload: {
        jsonrpc?: string;
        id?: unknown;
        method?: string;
        params?: Record<string, unknown>;
      } = {};

      if (body) {
        try {
          jsonPayload = JSON.parse(body);
        } catch {
          jsonPayload = {};
        }
      }

      const protocolVersionHeader = (
        req.headers['mcp-protocol-version'] as string | undefined
      )?.trim();

      if (!protocolVersionHeader) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: jsonPayload.id ?? null,
            error: {
              code: -32000,
              message: 'Missing required header: Mcp-Protocol-Version',
            },
          })
        );
        return;
      }

      if (!SUPPORTED_PROTOCOL_VERSIONS.has(protocolVersionHeader)) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: jsonPayload.id ?? null,
            error: {
              code: -32000,
              message: `Unsupported protocol version: '${protocolVersionHeader}'. Supported versions: '${PROTOCOL_VERSION_2026_07_28}', '2025-11-25'`,
            },
          })
        );
        return;
      }

      const bodyProtocolVersion = extractBodyProtocolVersion(jsonPayload);
      if (bodyProtocolVersion && bodyProtocolVersion !== protocolVersionHeader) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: jsonPayload.id ?? null,
            error: {
              code: -32020,
              message: `Header mismatch: Mcp-Protocol-Version header '${protocolVersionHeader}' does not match body metadata version '${bodyProtocolVersion}'`,
            },
          })
        );
        return;
      }

      const mcpMethodHeader = (req.headers['mcp-method'] as string | undefined)?.trim();
      if (!mcpMethodHeader) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: jsonPayload.id ?? null,
            error: { code: -32020, message: 'Missing required header: Mcp-Method' },
          })
        );
        return;
      }
      if (jsonPayload.method && mcpMethodHeader !== jsonPayload.method) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: jsonPayload.id ?? null,
            error: {
              code: -32020,
              message: `Header mismatch: Mcp-Method header '${mcpMethodHeader}' does not match JSON-RPC method '${jsonPayload.method}'`,
            },
          })
        );
        return;
      }

      const MCP_NAME_REQUIRED_METHODS = new Set(['tools/call', 'resources/read', 'prompts/get']);
      const effectiveMethod = jsonPayload.method ?? mcpMethodHeader;
      const mcpNameHeader = (req.headers['mcp-name'] as string | undefined)?.trim();
      if (MCP_NAME_REQUIRED_METHODS.has(effectiveMethod ?? '')) {
        if (!mcpNameHeader) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: jsonPayload.id ?? null,
              error: { code: -32020, message: 'Missing required header: Mcp-Name' },
            })
          );
          return;
        }
        const paramTarget = (
          (jsonPayload.params?.name ?? jsonPayload.params?.uri) as string | undefined
        )?.trim();
        if (paramTarget && paramTarget !== mcpNameHeader) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: jsonPayload.id ?? null,
              error: {
                code: -32020,
                message: `Header mismatch: Mcp-Name header '${mcpNameHeader}' does not match body parameter '${paramTarget}'`,
              },
            })
          );
          return;
        }
      } else if (mcpNameHeader) {
        const paramTarget = (
          (jsonPayload.params?.name ?? jsonPayload.params?.uri) as string | undefined
        )?.trim();
        if (paramTarget && paramTarget !== mcpNameHeader) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: jsonPayload.id ?? null,
              error: {
                code: -32020,
                message: `Header mismatch: Mcp-Name header '${mcpNameHeader}' does not match body parameter '${paramTarget}'`,
              },
            })
          );
          return;
        }
      }

      if (effectiveMethod === 'server/discover') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: jsonPayload.id ?? 1,
            result: {
              protocolVersion: PROTOCOL_VERSION_2026_07_28,
              serverInfo: {
                name: 'sdet-mcp',
                version: '1.0.0',
                description:
                  'Model Context Protocol Server providing test automation tools, resources, and runtime execution.',
              },
              capabilities: {
                tools: { listChanged: false },
                resources: { subscribe: false, listChanged: false },
                prompts: { listChanged: false },
              },
            },
          })
        );
        return;
      }

      // ─── SDK 2026-07-28 Compatibility Shim ────────────────────────────────
      // @modelcontextprotocol/sdk@1.30.x wire-level transport reads rawHeaders via
      // @hono/node-server (immutable Web Standard Request), so it cannot accept
      // 2026-07-28 — the version our gateway validated above.
      //
      // Splice mcp-protocol-version from rawHeaders before the SDK sees the request.
      // The SDK then falls back to its default negotiated version for tool execution.
      //
      // SDK upgrade path (remove this shim on @modelcontextprotocol/sdk v1.31.x+):
      //   1. Delete the rawHeaders loop below.
      //   2. Keep SUPPORTED_PROTOCOL_VERSIONS as { '2026-07-28' } in index.ts.
      //   3. Unskip the SDK Client Integration test in mcp-http.test.ts.
      // ────────────────────────────────────────────────────────────────────────
      const rawHeaders = req.rawHeaders;
      for (let i = rawHeaders.length - 2; i >= 0; i -= 2) {
        if (rawHeaders[i].toLowerCase() === 'mcp-protocol-version') {
          rawHeaders.splice(i, 2);
        }
      }

      // Route JSON-RPC payload to Streamable HTTP Transport via standard SDK contract
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      res.on('close', () => transport.close());
      await mcpServer.connect(transport);

      await transport.handleRequest(req, res, body ? jsonPayload : undefined);
    } catch (error) {
      console.error('[sdet-mcp] Unhandled transport error:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            error: { code: -32603, message: 'Internal Server Error' },
          })
        );
      }
    }
  });
}

export function createHttpServer() {
  return http.createServer(async (req, res) => {
    if (req.url === '/mcp') {
      if (!isLocalHostAndOrigin(req)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden: non-local host/origin');
        return;
      }

      const { originHeader } = extractHostAndOrigin(req);

      if (handleCorsPreflight(req, res, originHeader)) {
        return;
      }

      if (req.method === 'POST') {
        await handleMcpPostRequest(req, res, originHeader);
        return;
      }

      // MCP 2026-07-28 Spec: Streamable HTTP exclusively supports POST (GET stream endpoint removed)
      res.writeHead(405, {
        'Content-Type': 'text/plain',
        Allow: 'POST, OPTIONS',
      });
      res.end('Method Not Allowed: MCP 2026-07-28 Streamable HTTP requires POST');
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  });
}

export async function runStdioServer(): Promise<void> {
  const transport = new StdioServerTransport();
  await mcpServer.connect(transport);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (process.argv.includes('--stdio') || process.env.MCP_TRANSPORT === 'stdio') {
    runStdioServer().catch((err) => {
      console.error('[sdet-mcp] Stdio transport error:', err);
      process.exit(1);
    });
  } else {
    if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
      throw new Error(`Invalid PORT: "${rawPort}" — must be an integer between 1 and 65535`);
    }
    const httpServer = createHttpServer();
    httpServer.listen(PORT, '127.0.0.1', () => {
      console.log(
        `[MCP ${PROTOCOL_VERSION_2026_07_28} Spec] SDET Model Context Protocol Server running on http://127.0.0.1:${PORT}/mcp`
      );
    });
  }
}
