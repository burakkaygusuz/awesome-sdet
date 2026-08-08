import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createMcpServer, PROTOCOL_VERSION_2026_07_28 } from './server.js';

export const rawPort = process.env.PORT || '3000';
export const PORT = Number.parseInt(rawPort, 10);
export const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

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
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Method, Mcp-Name',
    'Access-Control-Max-Age': '86400',
  });
  res.end();
  return true;
}

export async function handleMcpPostRequest(
  req: http.IncomingMessage,
  res: http.ServerResponse,
  originHeader?: string
): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', originHeader || '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Mcp-Method, Mcp-Name'
  );
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');

  // Read request body to inspect direct 2026-07-28 discovery / RPC calls
  let body = '';
  req.on('data', (chunk) => {
    body += chunk;
  });

  req.on('end', async () => {
    try {
      if (body) {
        let jsonPayload: { jsonrpc?: string; id?: unknown; method?: string };
        try {
          jsonPayload = JSON.parse(body);
        } catch {
          jsonPayload = {};
        }

        // Direct 2026-07-28 server/discover support
        if (
          jsonPayload.method === 'server/discover' ||
          req.headers['mcp-method'] === 'server/discover'
        ) {
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
      }

      // Route JSON-RPC payload to Streamable HTTP Transport
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      res.on('close', () => transport.close());
      await mcpServer.connect(transport);

      // Rewrap request with buffered body stream for transport
      const simulatedReq = Object.assign(req, {
        rawBody: body,
      });
      await transport.handleRequest(simulatedReq, res, body ? JSON.parse(body) : undefined);
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
