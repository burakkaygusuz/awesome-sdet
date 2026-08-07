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
    tools?: Array<{
      name: string;
      description?: string;
      annotations?: {
        readOnlyHint?: boolean;
        destructiveHint?: boolean;
        idempotentHint?: boolean;
        openWorldHint?: boolean;
      };
    }>;
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
      expect(toolNames.has('read_se_pagefactory_docs')).toBe(true);
      expect(toolNames.has('read_se_locator_docs')).toBe(true);
      expect(toolNames.has('read_se_grid_docs')).toBe(true);
      expect(toolNames.has('read_cy_commands_docs')).toBe(true);

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
    it('initialize handshake matches LATEST_PROTOCOL_VERSION', async () => {
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

    it('tools/list returns all registered Selenium & Cypress tools with safety annotations', async () => {
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

      const tools = data.result?.tools || [];
      const toolNames = new Set(tools.map((t) => t.name));

      // Selenium Tools
      expect(toolNames.has('execute_se_explicit_wait')).toBe(true);
      expect(toolNames.has('read_se_pagefactory_docs')).toBe(true);
      expect(toolNames.has('read_se_locator_docs')).toBe(true);
      expect(toolNames.has('read_se_grid_docs')).toBe(true);

      // Cypress Tools
      expect(toolNames.has('read_cy_commands_docs')).toBe(true);
      expect(toolNames.has('read_cy_network_docs')).toBe(true);
      expect(toolNames.has('read_cy_session_docs')).toBe(true);
      expect(toolNames.has('read_cy_shadow_docs')).toBe(true);
      expect(toolNames.has('read_cy_component_docs')).toBe(true);
      expect(toolNames.has('read_cy_task_docs')).toBe(true);
      expect(toolNames.has('read_cy_stubs_spies_docs')).toBe(true);
      expect(toolNames.has('read_cy_fixtures_docs')).toBe(true);

      // Safety Annotations Check
      const seLocatorTool = tools.find((t) => t.name === 'read_se_locator_docs');
      expect(seLocatorTool?.annotations).toBeDefined();
      expect(seLocatorTool?.annotations?.readOnlyHint).toBe(true);
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

    it('tools/call - read_cy_commands_docs by language', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 41,
          method: 'tools/call',
          params: {
            name: 'read_cy_commands_docs',
            arguments: {
              language: 'typescript',
            },
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(41);
      expect(data.result).toBeDefined();
      const text = data.result?.content?.[0]?.text || '';
      expect(text).toContain('cy.get');
    });

    it('tools/call - Cypress tools suite execution (component, network, session, shadow, task, stubs, fixtures)', async () => {
      const cyTools = [
        { name: 'read_cy_component_docs', keyText: 'mount' },
        { name: 'read_cy_network_docs', keyText: 'cy.intercept' },
        { name: 'read_cy_session_docs', keyText: 'cy.session' },
        { name: 'read_cy_shadow_docs', keyText: 'shadow' },
        { name: 'read_cy_task_docs', keyText: 'cy.task' },
        { name: 'read_cy_stubs_spies_docs', keyText: 'cy.spy' },
        { name: 'read_cy_fixtures_docs', keyText: 'cy.fixture' },
      ];

      for (const t of cyTools) {
        const res = await fetch(url, {
          method: 'POST',
          headers: MCP_HEADERS,
          body: JSON.stringify({
            jsonrpc: '2.0',
            id: 50,
            method: 'tools/call',
            params: {
              name: t.name,
              arguments: { language: 'typescript' },
            },
          }),
        });

        expect(res.status).toBe(200);
        const data = await parseMcpResponse(res);
        expect(data.result).toBeDefined();
        const text = data.result?.content?.[0]?.text || '';
        expect(text.toLowerCase()).toContain(t.keyText.toLowerCase());
      }
    });

    it('tools/call - invalid language returns handled isError: true', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 51,
          method: 'tools/call',
          params: {
            name: 'read_cy_commands_docs',
            arguments: {
              language: 'unsupported_lang',
            },
          },
        }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result).toBeDefined();
      expect(data.result?.isError).toBe(true);
      const text = data.result?.content?.[0]?.text || '';
      expect(text).toContain('Unsupported language');
    });

    it('security headers - returns X-Content-Type-Options, X-Frame-Options, Referrer-Policy', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 60, method: 'tools/list' }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect(res.headers.get('x-frame-options')).toBe('DENY');
      expect(res.headers.get('referrer-policy')).toBe('no-referrer');
    });

    it('route protection - returns 404 for non-existent path', async () => {
      const baseUrl = url.replace('/mcp', '');
      const res = await fetch(`${baseUrl}/non-existent-route`, {
        method: 'GET',
      });
      expect(res.status).toBe(404);
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
  });
});
