import http from 'node:http';

import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

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
    it('rejects missing Mcp-Protocol-Version with HTTP 400 and -32020', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 92, method: 'server/discover' }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32020);
      expect.soft(data.error?.message).toContain('Missing required header: Mcp-Protocol-Version');
    });

    it('rejects request having body _meta protocolVersion but missing Mcp-Protocol-Version header with HTTP 400 and -32020', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 95,
          method: 'tools/list',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32020);
      expect.soft(data.error?.message).toContain('Missing required header: Mcp-Protocol-Version');
    });

    it('rejects unsupported protocol version with HTTP 400 and -32022', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Protocol-Version': '2023-01-01' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 93, method: 'server/discover' }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32022);
      expect.soft(data.error?.message).toContain('Unsupported protocol version');
      expect.soft(data.error?.data).toEqual({
        supported: ['2026-07-28'],
        requested: '2023-01-01',
      });
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
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2025-11-25',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32020);
      expect.soft(data.error?.message).toContain('Header mismatch');
    });
  });

  describe('Mcp-Method header', () => {
    it('rejects standard requests without Mcp-Method header with HTTP 400 and -32020', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 89,
          method: 'tools/list',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32020);
      expect.soft(data.error?.message).toContain('Missing required header: Mcp-Method');
    });

    it('rejects Mcp-Method / body method mismatch with HTTP 400 and -32020', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'tools/call' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 90,
          method: 'tools/list',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32020);
      expect.soft(data.error?.message).toContain('Mcp-Method header');
    });
  });

  describe('Mcp-Name header', () => {
    it('rejects tools/call requests without Mcp-Name header with HTTP 400 and -32020', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'tools/call' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 92,
          method: 'tools/call',
          params: {
            name: 'read_sdet_docs',
            arguments: { framework: 'selenium', domain: 'locators', language: 'typescript' },
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32020);
      expect.soft(data.error?.message).toContain('Missing required header: Mcp-Name');
    });

    it('rejects Mcp-Name / body name mismatch with HTTP 400 and -32020', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'tools/call', 'Mcp-Name': 'unexpected_tool_name' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 91,
          method: 'tools/call',
          params: {
            name: 'read_sdet_docs',
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
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
          { method: 'POST', headers: { ...MCP_HEADERS, Origin: 'https://evil.com' } },
          (res) => resolve(res.statusCode || 0)
        );
        req.on('error', reject);
        req.end(JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/list' }));
      });
      expect.soft(statusCode).toBe(403);
    });

    it('rejects malformed Origin header with HTTP 403', async () => {
      const statusCode = await new Promise<number>((resolve, reject) => {
        const req = http.request(
          url,
          { method: 'POST', headers: { ...MCP_HEADERS, Origin: 'not-a-url' } },
          (res) => resolve(res.statusCode || 0)
        );
        req.on('error', reject);
        req.end(JSON.stringify({ jsonrpc: '2.0', id: 100, method: 'tools/list' }));
      });
      expect.soft(statusCode).toBe(403);
    });
  });

  describe('JSON-RPC method dispatch', () => {
    it('returns HTTP 404 and -32601 for unknown methods', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'unknown/method' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 503,
          method: 'unknown/method',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(404);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32601);
      expect.soft(data.error?.message).toBe('Method not found');
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

    it('omits Access-Control-Allow-Origin for Origin-less (non-browser) POST requests', async () => {
      const res = await mcpFetch(url, { jsonrpc: '2.0', id: 97, method: 'tools/list' });

      expect.soft(res.status).toBe(200);
      expect.soft(res.headers.has('access-control-allow-origin')).toBe(false);
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

    it.each([
      { name: 'boolean id', payload: { jsonrpc: '2.0', id: true, method: 'server/discover' } },
      { name: 'null id', payload: { jsonrpc: '2.0', id: null, method: 'server/discover' } },
    ])('rejects invalid id format ($name) with HTTP 400 and -32600', async ({ payload }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'server/discover' },
        body: JSON.stringify(payload),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32600);
    });

    it('returns 200 with matching id and resultType complete for valid server/discover request', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'server/discover' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'discover-req-42',
          method: 'server/discover',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe('discover-req-42');
      expect.soft(data.result?.resultType).toBe('complete');
      expect.soft(data.result?.serverInfo?.name).toBe('sdet-mcp');
      expect.soft(data.result?.protocolVersion).toBe('2026-07-28');
    });
  });

  describe('MCP 2026-07-28 per-request _meta envelope validation', () => {
    const invalidMetaCases = [
      {
        name: 'empty _meta object',
        payload: { jsonrpc: '2.0', id: 201, method: 'tools/list', params: { _meta: {} } },
      },
      {
        name: 'missing protocolVersion',
        payload: {
          jsonrpc: '2.0',
          id: 202,
          method: 'tools/list',
          params: { _meta: { 'io.modelcontextprotocol/clientCapabilities': {} } },
        },
      },
      {
        name: 'missing clientCapabilities',
        payload: {
          jsonrpc: '2.0',
          id: 203,
          method: 'tools/list',
          params: { _meta: { 'io.modelcontextprotocol/protocolVersion': '2026-07-28' } },
        },
      },
    ];

    it.each(invalidMetaCases)('rejects $name with HTTP 400 and -32602', async ({ payload }) => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'tools/list' },
        body: JSON.stringify(payload),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.code).toBe(-32602);
    });

    it('accepts valid 2026-07-28 request containing mandatory _meta with HTTP 200', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'tools/list' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 206,
          method: 'tools/list',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe(206);
      expect.soft(Array.isArray(data.result?.tools)).toBe(true);
    });
  });

  describe('Accept header content negotiation', () => {
    it('accepts Streamable HTTP default application/json, text/event-stream with HTTP 200', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          Accept: 'application/json, text/event-stream',
          'Mcp-Method': 'tools/list',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 501,
          method: 'tools/list',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe(501);
    });

    it('rejects unsupported Accept header with HTTP 406 Not Acceptable', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          Accept: 'image/png',
          'Mcp-Method': 'tools/list',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 502,
          method: 'tools/list',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(406);
    });
  });

  describe('Payload size limit (MAX_BODY_BYTES)', () => {
    it('rejects payload exceeding 10MB limit with HTTP 413', async () => {
      const largePadding = 'x'.repeat(10 * 1024 * 1024 + 1024);
      const largeBody = JSON.stringify({
        jsonrpc: '2.0',
        id: 999,
        method: 'tools/list',
        params: {
          padding: largePadding,
          _meta: {
            'io.modelcontextprotocol/protocolVersion': '2026-07-28',
            'io.modelcontextprotocol/clientCapabilities': {},
          },
        },
      });

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'tools/list',
        },
        body: largeBody,
      });

      expect.soft(res.status).toBe(413);
      const data = await parseMcpResponse(res);
      expect.soft(data.error?.message).toContain('Payload Too Large');
    });
  });

  describe('Prototype pollution prevention', () => {
    it('safely handles prototype pollution attempts (__proto__, constructor) without server crash or pollution', async () => {
      const pollutedBody = JSON.stringify({
        jsonrpc: '2.0',
        id: 777,
        method: 'tools/list',
        params: {
          _meta: {
            'io.modelcontextprotocol/protocolVersion': '2026-07-28',
            'io.modelcontextprotocol/clientCapabilities': {},
          },
        },
      }).replace(
        '{"jsonrpc"',
        '{"__proto__":{"polluted":"yes_root"},"constructor":{"prototype":{"polluted_constructor":"yes"}},"jsonrpc"'
      );

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'tools/list',
        },
        body: pollutedBody,
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe(777);
      expect.soft(Array.isArray(data.result?.tools)).toBe(true);

      expect.soft((Object.prototype as Record<string, unknown>).polluted).toBeUndefined();
      expect
        .soft((Object.prototype as Record<string, unknown>).polluted_constructor)
        .toBeUndefined();
      expect.soft(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });

  describe('Internal error masking & stack trace protection', () => {
    it('returns generic error message without stack trace leakage on unhandled exceptions', async () => {
      const { mcpServer } = await import('../../servers/src/index.js');
      const spy = vi
        .spyOn(mcpServer, 'connect')
        .mockRejectedValueOnce(
          new Error(
            'SENSITIVE_INTERNAL_DATABASE_FAILURE: secret credentials at /var/data/db.sqlite:42'
          )
        );

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'tools/list',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 888,
          method: 'tools/list',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      spy.mockRestore();

      expect.soft(res.status).toBe(500);
      const rawText = await res.text();
      expect.soft(rawText).not.toContain('SENSITIVE_INTERNAL_DATABASE_FAILURE');
      expect.soft(rawText).not.toContain('/var/data/db.sqlite');
    });
  });

  describe('Protocol utility methods & notifications', () => {
    it('handles ping method with HTTP 200 and empty result object', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'ping',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'ping-1',
          method: 'ping',
          params: {
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe('ping-1');
      expect.soft(data.result).toEqual({});
    });

    it('accepts notifications/cancelled with HTTP 202 Accepted', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'notifications/cancelled',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/cancelled',
          params: {
            requestId: 'task-42',
            reason: 'User cancelled request',
          },
        }),
      });

      expect.soft(res.status).toBe(202);
      const text = await res.text();
      expect.soft(text).toBe('');
    });

    it('accepts notifications/initialized with HTTP 202 Accepted', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'notifications/initialized',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/initialized',
          params: {},
        }),
      });

      expect.soft(res.status).toBe(202);
      const text = await res.text();
      expect.soft(text).toBe('');
    });

    it('accepts notifications/message with HTTP 202 Accepted', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'notifications/message',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/message',
          params: {
            level: 'info',
            data: 'Client logging message',
          },
        }),
      });

      expect.soft(res.status).toBe(202);
      const text = await res.text();
      expect.soft(text).toBe('');
    });

    it('handles logging/setLevel method with HTTP 200 and empty result object', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'logging/setLevel',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'log-1',
          method: 'logging/setLevel',
          params: {
            level: 'info',
            _meta: {
              'io.modelcontextprotocol/protocolVersion': '2026-07-28',
              'io.modelcontextprotocol/clientCapabilities': {},
            },
          },
        }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe('log-1');
      expect.soft(data.result).toEqual({});
    });

    it('supports initialize lifecycle handshake over Streamable HTTP', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'initialize',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'init-1',
          method: 'initialize',
          params: {
            protocolVersion: '2026-07-28',
            capabilities: {},
            clientInfo: { name: 'test-client', version: '1.0.0' },
          },
        }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe('init-1');
      expect.soft(data.result?.serverInfo).toBeDefined();
    });

    it('accepts valid requests without _meta envelope', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'tools/list',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 'bare-1',
          method: 'tools/list',
          params: {},
        }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.id).toBe('bare-1');
      expect.soft(Array.isArray(data.result?.tools)).toBe(true);
    });
  });
});
