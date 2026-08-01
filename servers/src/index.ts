import http from 'node:http';
import { pathToFileURL } from 'node:url';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createSdetMcpServer } from './server.js';

const rawPort = process.env.PORT;
const PORT = rawPort === undefined ? 3000 : Number(rawPort);

export function createHttpServer() {
  return http.createServer(async (req, res) => {
    const allowedHosts = new Set(['localhost', '127.0.0.1', '[::1]']);

    if (req.method === 'POST' && req.url === '/mcp') {
      let hostName: string;
      const hostHeader = req.headers.host || '';
      if (hostHeader.startsWith('[::1]')) {
        hostName = '[::1]';
      } else {
        hostName = hostHeader.split(':')[0];
      }

      const originHeader = req.headers.origin;
      let originName = '';
      if (originHeader) {
        try {
          originName = new URL(originHeader).hostname;
        } catch {
          // ignore parsing errors
        }
      }

      if (!allowedHosts.has(hostName) || (originHeader && !allowedHosts.has(originName))) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('Forbidden: non-local host/origin');
        return;
      }

      const mcpServer = createSdetMcpServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
      });
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res);
      return;
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
  // Note: Changing to a non-loopback deployment requires authenticated transport (OAuth 2.0/OIDC or equivalent gateway) and a separate threat-model review.
  httpServer.listen(PORT, '127.0.0.1', () => {
    console.log(
      `[MCP 2026-07-28 Spec] Stateless SDET Selenium MCP Server running on http://127.0.0.1:${PORT}/mcp`
    );
  });
}
