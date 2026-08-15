import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createMcpServer, PROTOCOL_VERSION_2026_07_28 } from './server.js';
import { SERVER_NAME, SERVER_VERSION, SERVER_DESCRIPTION } from './version.js';

export const rawPort = process.env.PORT || '3000';
export const PORT = Number.parseInt(rawPort, 10);
export const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

export const SUPPORTED_PROTOCOL_VERSIONS = new Set([PROTOCOL_VERSION_2026_07_28]);

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

export const PROTOCOL_VERSION_META_KEY = 'io.modelcontextprotocol/protocolVersion';
export const CLIENT_CAPABILITIES_META_KEY = 'io.modelcontextprotocol/clientCapabilities';
export const MAX_BODY_BYTES = 10 * 1024 * 1024; // 10MB

export function safeJsonParse<T = unknown>(text: string): T {
  return JSON.parse(text, (key, value) => {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return undefined;
    }
    return value;
  });
}

export interface EnvelopeValidationResult {
  ok: boolean;
  code?: number;
  message?: string;
  protocolVersion?: string;
}

export function extractBodyProtocolVersion(payload: Record<string, unknown>): string | undefined {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return undefined;

  const params = Object.hasOwn(payload, 'params')
    ? (payload.params as Record<string, unknown>)
    : undefined;
  if (params && typeof params === 'object' && !Array.isArray(params)) {
    const meta = Object.hasOwn(params, '_meta')
      ? (params._meta as Record<string, unknown>)
      : undefined;
    if (meta && typeof meta === 'object' && !Array.isArray(meta)) {
      const v = Object.hasOwn(meta, PROTOCOL_VERSION_META_KEY)
        ? meta[PROTOCOL_VERSION_META_KEY]
        : undefined;
      if (typeof v === 'string' && v.trim().length > 0) return v.trim();
    }
  }

  return undefined;
}

export function validateRequestEnvelope(
  payload: Record<string, unknown>
): EnvelopeValidationResult {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      ok: false,
      code: -32600,
      message: 'Invalid Request: payload must be an object',
    };
  }

  const params = Object.hasOwn(payload, 'params')
    ? (payload.params as Record<string, unknown>)
    : undefined;
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return {
      ok: false,
      code: -32602,
      message: 'Invalid params: missing required per-request envelope key(s): _meta',
    };
  }

  const meta = Object.hasOwn(params, '_meta')
    ? (params._meta as Record<string, unknown>)
    : undefined;
  if (!meta || typeof meta !== 'object' || Array.isArray(meta)) {
    return {
      ok: false,
      code: -32602,
      message: 'Invalid params: missing required per-request envelope key(s): _meta',
    };
  }

  const protocolVersion = Object.hasOwn(meta, PROTOCOL_VERSION_META_KEY)
    ? meta[PROTOCOL_VERSION_META_KEY]
    : undefined;
  if (typeof protocolVersion !== 'string' || protocolVersion.trim().length === 0) {
    return {
      ok: false,
      code: -32602,
      message: `Invalid _meta envelope for protocol revision ${PROTOCOL_VERSION_2026_07_28}: ${PROTOCOL_VERSION_META_KEY}: missing`,
    };
  }

  const clientCapabilities = Object.hasOwn(meta, CLIENT_CAPABILITIES_META_KEY)
    ? meta[CLIENT_CAPABILITIES_META_KEY]
    : undefined;
  if (
    clientCapabilities === undefined ||
    typeof clientCapabilities !== 'object' ||
    clientCapabilities === null ||
    Array.isArray(clientCapabilities)
  ) {
    return {
      ok: false,
      code: -32602,
      message: `Invalid _meta envelope for protocol revision ${PROTOCOL_VERSION_2026_07_28}: ${CLIENT_CAPABILITIES_META_KEY}: missing`,
    };
  }

  return {
    ok: true,
    protocolVersion: protocolVersion.trim(),
  };
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

  const contentLength = Number.parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > MAX_BODY_BYTES) {
    res.writeHead(413, { 'Content-Type': 'application/json' });
    res.end(
      JSON.stringify({
        jsonrpc: '2.0',
        id: null,
        error: {
          code: -32600,
          message: 'Payload Too Large: request body exceeds 10MB limit',
        },
      })
    );
    req.resume();
    return;
  }

  let body = '';
  let receivedBytes = 0;
  let exceeded = false;

  req.on('data', (chunk: Buffer | string) => {
    if (exceeded) return;
    const chunkLength = typeof chunk === 'string' ? Buffer.byteLength(chunk) : chunk.length;
    receivedBytes += chunkLength;

    if (receivedBytes > MAX_BODY_BYTES) {
      exceeded = true;
      if (!res.headersSent) {
        res.writeHead(413, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: {
              code: -32600,
              message: 'Payload Too Large: request body exceeds 10MB limit',
            },
          })
        );
      }
      req.resume();
      return;
    }

    body += chunk;
  });

  req.on('end', async () => {
    if (exceeded) return;
    let jsonPayload: {
      jsonrpc?: string;
      id?: unknown;
      method?: string;
      params?: Record<string, unknown>;
    } = {};

    try {
      if (body) {
        try {
          jsonPayload = safeJsonParse(body);
        } catch {
          jsonPayload = {};
        }
      }

      const rawProtocolVersionHeader = (
        req.headers['mcp-protocol-version'] as string | undefined
      )?.trim();
      const protocolVersionHeader = rawProtocolVersionHeader?.split(',')[0]?.trim();

      if (!protocolVersionHeader) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: jsonPayload.id ?? null,
            error: {
              code: -32020,
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
              code: -32022,
              message: `Unsupported protocol version: '${protocolVersionHeader}'. Supported version: '${PROTOCOL_VERSION_2026_07_28}'`,
              data: {
                supported: Array.from(SUPPORTED_PROTOCOL_VERSIONS),
                requested: protocolVersionHeader,
              },
            },
          })
        );
        return;
      }

      if (jsonPayload.jsonrpc !== undefined && jsonPayload.jsonrpc !== '2.0') {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: jsonPayload.id ?? null,
            error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
          })
        );
        return;
      }

      if (jsonPayload.id !== undefined) {
        const isString = typeof jsonPayload.id === 'string';
        const isInteger = typeof jsonPayload.id === 'number' && Number.isInteger(jsonPayload.id);

        if (!isString && !isInteger) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32600,
                message: 'Invalid Request: id must be a string or integer (null is not allowed)',
              },
            })
          );
          return;
        }
      }

      const mcpMethodHeader = (req.headers['mcp-method'] as string | undefined)?.trim();
      if (mcpMethodHeader && jsonPayload.method && mcpMethodHeader !== jsonPayload.method) {
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

      const effectiveMethod = jsonPayload.method ?? mcpMethodHeader;
      const mcpNameHeader = (req.headers['mcp-name'] as string | undefined)?.trim();
      if (mcpNameHeader) {
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

      const isRequest = jsonPayload.method !== undefined && jsonPayload.id !== undefined;
      if (isRequest) {
        const envelopeValidation = validateRequestEnvelope(jsonPayload);
        if (!envelopeValidation.ok) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: jsonPayload.id ?? null,
              error: {
                code: envelopeValidation.code ?? -32602,
                message: envelopeValidation.message,
              },
            })
          );
          return;
        }

        if (
          envelopeValidation.protocolVersion &&
          envelopeValidation.protocolVersion !== protocolVersionHeader
        ) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: jsonPayload.id ?? null,
              error: {
                code: -32020,
                message: `Header mismatch: Mcp-Protocol-Version header '${protocolVersionHeader}' does not match body metadata version '${envelopeValidation.protocolVersion}'`,
              },
            })
          );
          return;
        }
      }

      if (effectiveMethod === 'server/discover') {
        if (jsonPayload.jsonrpc !== '2.0') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: { code: -32600, message: 'Invalid Request: jsonrpc must be "2.0"' },
            })
          );
          return;
        }

        if (jsonPayload.id === undefined) {
          res.writeHead(202);
          res.end();
          return;
        }

        const isString = typeof jsonPayload.id === 'string';
        const isInteger = typeof jsonPayload.id === 'number' && Number.isInteger(jsonPayload.id);

        if (!isString && !isInteger) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              jsonrpc: '2.0',
              id: null,
              error: {
                code: -32600,
                message: 'Invalid Request: id must be a string or integer (null is not allowed)',
              },
            })
          );
          return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: jsonPayload.id,
            result: {
              resultType: 'complete',
              protocolVersion: PROTOCOL_VERSION_2026_07_28,
              serverInfo: {
                name: SERVER_NAME,
                version: SERVER_VERSION,
                description: SERVER_DESCRIPTION,
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

      const transport = new NodeStreamableHTTPServerTransport({
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
            id:
              jsonPayload &&
              typeof jsonPayload === 'object' &&
              (typeof jsonPayload.id === 'string' || Number.isInteger(jsonPayload.id))
                ? jsonPayload.id
                : null,
            error: { code: -32603, message: 'Internal error' },
          })
        );
      }
    }
  });
}

export function createHttpServer() {
  return http.createServer(async (req, res) => {
    try {
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

        res.writeHead(405, {
          'Content-Type': 'text/plain',
          Allow: 'POST, OPTIONS',
        });
        res.end('Method Not Allowed: MCP 2026-07-28 Streamable HTTP requires POST');
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
    } catch (error) {
      console.error('[sdet-mcp] Top-level HTTP server error:', error);
      if (!res.headersSent) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(
          JSON.stringify({
            jsonrpc: '2.0',
            id: null,
            error: { code: -32603, message: 'Internal error' },
          })
        );
      }
    }
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
