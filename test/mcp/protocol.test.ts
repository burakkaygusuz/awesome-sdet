import http from 'node:http';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createHttpServer } from '../../servers/src/index.js';
import { closeServer, listenServer, MCP_HEADERS, mcpFetch, parseMcpResponse } from '../helpers.js';

describe('MCP 2026-07-28 Protocol Validation', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createHttpServer();
    url = await listenServer(server);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe('Mcp-Protocol-Version header', () => {
    it('rejects missing Mcp-Protocol-Version with HTTP 400 and -32000', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 92, method: 'server/discover' }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32000);
      expect.soft(data.error?.message).toContain('Missing required header: Mcp-Protocol-Version');
    });

    it('rejects unsupported protocol version with HTTP 400 and -32000', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Protocol-Version': '2023-01-01' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 93, method: 'server/discover' }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32000);
      expect.soft(data.error?.message).toContain('Unsupported protocol version');
    });

    it('rejects header vs body _meta protocol version mismatch with HTTP 400 and -32020', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Protocol-Version': '2026-07-28',
          'Mcp-Method': 'tools/list',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 94,
          method: 'tools/list',
          params: { _meta: { 'io.modelcontextprotocol/protocolVersion': '2025-11-25' } },
        }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32020);
      expect.soft(data.error?.message).toContain('Header mismatch');
    });
  });

  describe('Mcp-Method header', () => {
    it('allows standard requests without Mcp-Method header', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 89, method: 'tools/list' }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe(89);
      expect.soft(Array.isArray(data.result?.tools)).toBe(true);
    });

    it('rejects Mcp-Method / body method mismatch with HTTP 400 and -32020', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'tools/call' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 90, method: 'tools/list' }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32020);
      expect.soft(data.error?.message).toContain('Mcp-Method header');
    });
  });

  describe('Mcp-Name header', () => {
    it('allows tools/call requests without Mcp-Name header', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 92,
          method: 'tools/call',
          params: { name: 'read_se_locator_docs', arguments: { language: 'typescript' } },
        }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe(92);
      expect.soft(Array.isArray(data.result?.content)).toBe(true);
    });

    it('rejects Mcp-Name / body name mismatch with HTTP 400 and -32020', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'tools/call', 'Mcp-Name': 'unexpected_tool_name' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 91,
          method: 'tools/call',
          params: { name: 'read_selenium_docs' },
        }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32020);
      expect.soft(data.error?.message).toContain('Mcp-Name header');
    });
  });

  describe('HTTP method guard', () => {
    it('rejects GET /mcp with HTTP 405', async () => {
      const res = await fetch(url, { method: 'GET' });

      expect.soft(res.status).toBe(405);
      expect.soft(res.headers.get('allow')).toContain('POST');
    });
  });

  describe('Host / Origin guard', () => {
    it('rejects non-local Host header with HTTP 403', async () => {
      const statusCode = await new Promise<number>((resolve, reject) => {
        const req = http.request(
          url,
          { method: 'POST', headers: { ...MCP_HEADERS, Host: 'example.test' } },
          (res) => resolve(res.statusCode || 0)
        );
        req.on('error', reject);
        req.end(JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/list' }));
      });
      expect.soft(statusCode).toBe(403);
    });

    it('rejects non-local Origin header with HTTP 403', async () => {
      const statusCode = await new Promise<number>((resolve, reject) => {
        const req = http.request(
          url,
          { method: 'POST', headers: { ...MCP_HEADERS, Origin: 'http://evil.com' } },
          (res) => resolve(res.statusCode || 0)
        );
        req.on('error', reject);
        req.end(JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/list' }));
      });
      expect.soft(statusCode).toBe(403);
    });
  });

  describe('CORS preflight', () => {
    it('returns 204 with correct 2026-07-28 headers and no obsolete x-mcp-session-id', async () => {
      const res = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          Host: '127.0.0.1',
          Origin: 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
        },
      });

      expect.soft(res.status).toBe(204);
      expect.soft(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
      expect.soft(res.headers.get('access-control-allow-methods')).toContain('POST');
      const allowHeaders = res.headers.get('access-control-allow-headers') || '';
      expect.soft(allowHeaders).toContain('Mcp-Method');
      expect.soft(allowHeaders).toContain('Mcp-Name');
      expect.soft(allowHeaders).toContain('Mcp-Protocol-Version');
      expect.soft(allowHeaders).not.toContain('x-mcp-session-id');
    });
  });

  describe('Security response headers', () => {
    it('includes X-Content-Type-Options, X-Frame-Options, Referrer-Policy', async () => {
      const res = await mcpFetch(url, { jsonrpc: '2.0', id: 60, method: 'tools/list' });

      expect.soft(res.status).toBe(200);
      expect.soft(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect.soft(res.headers.get('x-frame-options')).toBe('DENY');
      expect.soft(res.headers.get('referrer-policy')).toBe('no-referrer');
    });
  });

  describe('server/discover protocol & notification compliance', () => {
    it('does not send JSON-RPC response to notifications without id', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'server/discover' },
        body: JSON.stringify({ jsonrpc: '2.0', method: 'server/discover' }),
      });

      expect.soft(res.status).toBe(202);
      const text = await res.text();
      expect.soft(text).toBe('');
    });

    it('rejects invalid jsonrpc version on server/discover with HTTP 400 and -32600', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'server/discover' },
        body: JSON.stringify({ jsonrpc: '1.0', id: 101, method: 'server/discover' }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32600);
      expect.soft(data.error?.message).toContain('Invalid Request');
    });

    it('rejects non-primitive id on server/discover with HTTP 400 and -32600', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'server/discover' },
        body: JSON.stringify({ jsonrpc: '2.0', id: true, method: 'server/discover' }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32600);
      expect.soft(data.error?.message).toContain('Invalid Request');
    });

    it('returns 200 with matching id and resultType complete for valid server/discover request', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'server/discover' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 'discover-req-42', method: 'server/discover' }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe('discover-req-42');
      expect.soft(data.result?.resultType).toBe('complete');
      expect.soft(data.result?.serverInfo?.name).toBe('sdet-mcp');
      expect.soft(data.result?.protocolVersion).toBe('2026-07-28');
    });
  });
});
