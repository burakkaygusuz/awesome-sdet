import http from 'node:http';
import { AddressInfo } from 'node:net';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { LATEST_PROTOCOL_VERSION } from '@modelcontextprotocol/sdk/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createHttpServer } from '../dist/index.js';

const MCP_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
};

interface JsonRpcResponse {
  jsonrpc: string;
  id: number;
  result?: {
    protocolVersion?: string;
    tools?: Array<{ name: string }>;
    content?: Array<{ type: string; text?: string }>;
    isError?: boolean;
  };
  error?: {
    code: number;
    message: string;
  };
}

async function parseMcpResponse(res: Response): Promise<JsonRpcResponse> {
  const rawText = await res.text();
  if (rawText.includes('data: ')) {
    const jsonStr = rawText.substring(rawText.indexOf('{'));
    return JSON.parse(jsonStr);
  }
  return JSON.parse(rawText);
}

describe('MCP HTTP Transport Protocol Tests', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createHttpServer();
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => resolve());
    });

    const address = server.address() as AddressInfo;
    if (!address || typeof address === 'string') {
      throw new Error('Server address is not an AddressInfo object');
    }
    url = `http://127.0.0.1:${address.port}/mcp`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error?: Error) => (error ? reject(error) : resolve()))
    );
  });

  describe('Official MCP SDK Client Integration', () => {
    it('connects, lists tools, and executes tool using StreamableHTTPClientTransport', async () => {
      const transport = new StreamableHTTPClientTransport(new URL(url));
      const client = new Client({ name: 'test-sdk-client', version: '1.0.0' });

      await client.connect(transport);

      const toolsResponse = await client.listTools();
      const toolNames = new Set(toolsResponse.tools.map((t) => t.name));
      expect(toolNames.has('execute_se_explicit_wait')).toBe(true);
      expect(toolNames.has('execute_se_cdp_intercept')).toBe(true);
      expect(toolNames.has('read_se_pagefactory_docs')).toBe(true);
      expect(toolNames.has('read_se_locator_docs')).toBe(true);
      expect(toolNames.has('read_se_grid_docs')).toBe(true);

      const callResponse = await client.callTool({
        name: 'read_se_locator_docs',
        arguments: { strategy: 'relativeLocators', language: 'python' },
      });

      const content = callResponse.content as Array<{ type: string; text?: string }> | undefined;
      expect(content).toBeDefined();
      const text = content?.[0]?.text || '';
      expect(text).toContain('locate_with');

      await client.close();
    });
  });

  describe('Wire Protocol & HTTP Security Guard Tests', () => {
    it('initialize', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: LATEST_PROTOCOL_VERSION,
            capabilities: {},
            clientInfo: { name: 'test-client', version: '1.0.0' },
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(1);
      expect(data.result).toBeDefined();
      expect(data.result?.protocolVersion).toBe(LATEST_PROTOCOL_VERSION);
    });

    it('tools/list', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(2);
      expect(data.result).toBeDefined();
      const toolNames = new Set(data.result?.tools?.map((t) => t.name));
      expect(toolNames.has('execute_se_explicit_wait')).toBe(true);
      expect(toolNames.has('execute_se_cdp_intercept')).toBe(true);
      expect(toolNames.has('read_se_pagefactory_docs')).toBe(true);
      expect(toolNames.has('read_se_locator_docs')).toBe(true);
      expect(toolNames.has('read_se_grid_docs')).toBe(true);
    });

    it('tools/call - read_se_locator_docs by strategy & language', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 40,
          method: 'tools/call',
          params: {
            name: 'read_se_locator_docs',
            arguments: {
              strategy: 'xpath',
              language: 'typescript',
            },
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(40);
      expect(data.result).toBeDefined();
      const text = data.result?.content?.[0]?.text || '';
      expect(text).toContain('By.xpath');
    });

    it('tools/call - read_pagefactory_docs by className', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 30,
          method: 'tools/call',
          params: {
            name: 'read_se_pagefactory_docs',
            arguments: {
              className: 'AjaxElementLocator',
            },
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(30);
      expect(data.result).toBeDefined();
      expect(Array.isArray(data.result?.content)).toBe(true);
      const text = data.result?.content?.[0]?.text || '';
      expect(text).toContain('AjaxElementLocator');
    });

    it('tools/call - read_pagefactory_docs by language (python, typescript, csharp)', async () => {
      for (const lang of ['python', 'typescript', 'csharp', 'ruby', 'javascript']) {
        const res = await fetch(url, {
          method: 'POST',
          headers: MCP_HEADERS,
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 31,
            method: 'tools/call',
            params: {
              name: 'read_se_pagefactory_docs',
              arguments: {
                language: lang,
              },
            },
          }),
        });

        expect(res.status).toBe(200);
        const data = await parseMcpResponse(res);
        expect(data.result).toBeDefined();
        const text = data.result?.content?.[0]?.text || '';
        expect(text.toLowerCase()).toContain(lang);
      }
    });

    it('tools/call - valid call', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 3,
          method: 'tools/call',
          params: {
            name: 'execute_se_explicit_wait',
            arguments: {
              targetUrl: 'https://example.com',
              condition: 'elementToBeClickable',
              locator: { by: 'id', value: 'button' },
            },
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(3);
      expect(data.result).toBeDefined();
      expect(Array.isArray(data.result?.content)).toBe(true);
      const responseText = data.result?.content?.[0]?.text || '';
      expect(responseText).toContain('no browser was driven');
    });

    it('tools/call - invalid call', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 4,
          method: 'tools/call',
          params: {
            name: 'execute_se_explicit_wait',
            arguments: {
              targetUrl: 12345,
              condition: 'elementToBeClickable',
              locator: { by: 'id', value: 'button' },
            },
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(4);
      expect(data.result).toBeDefined();
      expect(data.result?.isError).toBe(true);
    });

    it('host/origin guard - rejects non-local Host', async () => {
      const statusCode = await new Promise<number>((resolve, reject) => {
        const req = http.request(
          url,
          {
            method: 'POST',
            headers: { ...MCP_HEADERS, Host: 'example.test' },
          },
          (res) => resolve(res.statusCode || 0)
        );
        req.on('error', reject);
        req.end(JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/list' }));
      });
      expect(statusCode).toBe(403);
    });

    it('host/origin guard - rejects non-local Origin', async () => {
      const statusCode = await new Promise<number>((resolve, reject) => {
        const req = http.request(
          url,
          {
            method: 'POST',
            headers: { ...MCP_HEADERS, Origin: 'http://evil.com' },
          },
          (res) => resolve(res.statusCode || 0)
        );
        req.on('error', reject);
        req.end(JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/list' }));
      });
      expect(statusCode).toBe(403);
    });

    it('cors preflight - handles OPTIONS /mcp for local origin', async () => {
      const res = await fetch(url, {
        method: 'OPTIONS',
        headers: {
          Host: '127.0.0.1',
          Origin: 'http://localhost:5173',
          'Access-Control-Request-Method': 'POST',
        },
      });

      expect(res.status).toBe(204);
      expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:5173');
      expect(res.headers.get('access-control-allow-methods')).toContain('POST');
    });

    it('cors headers - includes Access-Control-Allow-Origin on POST', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          Origin: 'http://localhost:3000',
        },
        body: JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/list' }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
    });

    it('tools/call - credentials not reflected', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 5,
          method: 'tools/call',
          params: {
            name: 'execute_se_cdp_intercept',
            arguments: {
              targetUrl: 'https://example.com',
              urlPattern: '*://api.example.com/*',
              action: 'injectBasicAuth',
              authCredentials: {
                username: 'secret_user_name',
                password: 'secret_password_123',
              },
            },
          },
        }),
      });

      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).not.toContain('secret_user_name');
      expect(text).not.toContain('secret_password_123');
    });

    it('tools/call - response does not echo input parameters', async () => {
      const SENTINEL_URL = 'https://unique-sentinel-target-url.example.com/path';
      const SENTINEL_VALUE = 'unique-sentinel-locator-value-9f3a';
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 10,
          method: 'tools/call',
          params: {
            name: 'execute_se_explicit_wait',
            arguments: {
              targetUrl: SENTINEL_URL,
              condition: 'elementToBeClickable',
              locator: { by: 'id', value: SENTINEL_VALUE },
            },
          },
        }),
      });
      expect(res.status).toBe(200);
      const text = await res.text();
      expect(text).not.toContain(SENTINEL_URL);
      expect(text).not.toContain(SENTINEL_VALUE);
    });

    it('tools/call - rejects targetUrl exceeding 2048 chars', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2048);
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 11,
          method: 'tools/call',
          params: {
            name: 'execute_se_explicit_wait',
            arguments: {
              targetUrl: longUrl,
              condition: 'elementToBeClickable',
              locator: { by: 'id', value: 'btn' },
            },
          },
        }),
      });
      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);
    });

    it('tools/call - rejects locator.value exceeding 512 chars', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 12,
          method: 'tools/call',
          params: {
            name: 'execute_se_explicit_wait',
            arguments: {
              targetUrl: 'https://example.com',
              condition: 'elementToBeClickable',
              locator: { by: 'id', value: 'x'.repeat(513) },
            },
          },
        }),
      });
      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);
    });

    it('tools/call - rejects urlPattern exceeding 1024 chars', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 13,
          method: 'tools/call',
          params: {
            name: 'execute_se_cdp_intercept',
            arguments: {
              targetUrl: 'https://example.com',
              urlPattern: '*/' + 'p'.repeat(1024),
              action: 'blockRequest',
            },
          },
        }),
      });
      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);
    });

    it('tools/call - rejects mockResponseBody exceeding 4096 chars', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 14,
          method: 'tools/call',
          params: {
            name: 'execute_se_cdp_intercept',
            arguments: {
              targetUrl: 'https://example.com',
              urlPattern: '*/api/*',
              action: 'mockResponse',
              mockResponseBody: 'b'.repeat(4097),
            },
          },
        }),
      });
      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);
    });
  });
});
