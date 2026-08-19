import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import { createMcpServer } from './server.js';
import { PROTOCOL_VERSION_2026_07_28 } from './version.js';
import {
  isValidRequestId,
  payloadTooLargeReply,
  safeJsonParse,
  writeJsonRpcError,
  type RpcPayload,
} from './http/jsonrpc.js';
import {
  collectBodyWithinLimit,
  decodeHeaderValue,
  extractHostAndOrigin,
  handleCorsPreflight,
  isLocalHostAndOrigin,
  MAX_BODY_BYTES,
} from './http/security.js';
import {
  handleServerDiscover,
  jsonRpcShapeError,
  methodHeaderError,
  nameHeaderError,
  protocolVersionHeaderError,
  requestEnvelopeError,
} from './http/request-guards.js';

export const rawPort = process.env.PORT || '3000';
export const PORT = Number.parseInt(rawPort, 10);

export const mcpServer = createMcpServer();

export async function handleMcpPostRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  originHeader?: string
): Promise<void> {
  if (originHeader) {
    res.setHeader('Access-Control-Allow-Origin', originHeader);
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, Mcp-Method, Mcp-Name, Mcp-Protocol-Version'
    );
  }
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');

  const contentLength = Number.parseInt(req.headers['content-length'] || '0', 10);
  if (contentLength > MAX_BODY_BYTES) {
    writeJsonRpcError(res, payloadTooLargeReply());
    req.resume();
    return;
  }

  const body = await collectBodyWithinLimit(req, res);
  if (body === null) return;

  let jsonPayload: RpcPayload = {};
  try {
    if (body) jsonPayload = safeJsonParse(body);
  } catch {
    jsonPayload = {};
  }

  const protocolVersionHeader = (
    (req.headers['mcp-protocol-version'] as string | undefined)?.split(',')[0] ?? ''
  ).trim();
  const mcpMethodHeader = (req.headers['mcp-method'] as string | undefined)?.trim();
  const effectiveMethod = jsonPayload.method ?? mcpMethodHeader;
  const rawMcpNameHeader = (req.headers['mcp-name'] as string | undefined)?.trim();
  const mcpNameHeader = rawMcpNameHeader ? decodeHeaderValue(rawMcpNameHeader) : undefined;

  try {
    const error =
      protocolVersionHeaderError(protocolVersionHeader || undefined, jsonPayload) ??
      jsonRpcShapeError(jsonPayload) ??
      methodHeaderError(mcpMethodHeader, effectiveMethod, jsonPayload) ??
      nameHeaderError(mcpNameHeader, effectiveMethod ?? '', jsonPayload) ??
      requestEnvelopeError(jsonPayload, protocolVersionHeader);
    if (error) {
      writeJsonRpcError(res, error);
      return;
    }

    if (effectiveMethod === 'server/discover') {
      handleServerDiscover(res, jsonPayload);
      return;
    }

    if (effectiveMethod === 'ping' || effectiveMethod === 'logging/setLevel') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ jsonrpc: '2.0', id: jsonPayload.id, result: {} }));
      return;
    }

    if (effectiveMethod?.startsWith('notifications/')) {
      res.writeHead(202);
      res.end();
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
      writeJsonRpcError(res, {
        status: 500,
        id: isValidRequestId(jsonPayload?.id) ? jsonPayload.id : null,
        error: { code: -32603, message: 'Internal error' },
      });
    }
  }
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
        writeJsonRpcError(res, {
          status: 500,
          id: null,
          error: { code: -32603, message: 'Internal error' },
        });
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
