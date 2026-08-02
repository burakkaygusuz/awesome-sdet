import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createSdetMcpServer } from './server.js';

const rawPort = process.env.PORT;
const PORT = rawPort === undefined ? 3000 : Number(rawPort);

const ALLOWED_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

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
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-mcp-session-id',
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, x-mcp-session-id');

  const mcpServer = createSdetMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await mcpServer.connect(transport);
  await transport.handleRequest(req, res);
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

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
    throw new Error(`Invalid PORT: "${rawPort}" — must be an integer between 1 and 65535`);
  }
  const httpServer = createHttpServer();
  httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(
      `[MCP 2026-07-28 Spec] Stateless SDET Selenium MCP Server running on http://127.0.0.1:${PORT}/mcp`
    );
  });
}
