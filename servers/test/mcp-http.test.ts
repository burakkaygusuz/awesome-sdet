import http from 'node:http';
import { AddressInfo } from 'node:net';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
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
    serverInfo?: {
      name: string;
      version: string;
      description?: string;
    };
    capabilities?: Record<string, unknown>;
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
    resources?: Array<{
      uri: string;
      name?: string;
      mimeType?: string;
    }>;
    resourceTemplates?: Array<{
      uriTemplate: string;
      name?: string;
      mimeType?: string;
    }>;
    prompts?: Array<{
      name: string;
      description?: string;
      arguments?: Array<{ name: string; required?: boolean }>;
    }>;
    contents?: Array<{
      uri: string;
      text?: string;
      mimeType?: string;
    }>;
    messages?: Array<{
      role: string;
      content: { type: string; text?: string };
    }>;
    content?: Array<{ type: string; text?: string }>;
    ttlMs?: number;
    cacheScope?: string;
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

describe('MCP 2026-07-28 Stateless HTTP Transport & Protocol Tests', () => {
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
    it('connects, lists tools, resources, prompts, and executes tools using StreamableHTTPClientTransport', async () => {
      const transport = new StreamableHTTPClientTransport(new URL(url));
      const client = new Client({ name: 'test-sdk-client', version: '1.0.0' });

      await client.connect(transport);

      // Tools Primitive
      const toolsResponse = await client.listTools();
      const toolNames = new Set(toolsResponse.tools.map((t) => t.name));
      expect(toolNames.has('execute_se_explicit_wait')).toBe(true);
      expect(toolNames.has('read_se_pagefactory_docs')).toBe(true);
      expect(toolNames.has('read_se_locator_docs')).toBe(true);
      expect(toolNames.has('read_se_grid_docs')).toBe(true);
      expect(toolNames.has('read_cy_commands_docs')).toBe(true);

      // Prompts Primitive
      const promptsResponse = await client.listPrompts();
      const promptNames = new Set(promptsResponse.prompts.map((p) => p.name));
      expect(promptNames.has('generate-test')).toBe(true);
      expect(promptNames.has('migrate-test')).toBe(true);
      expect(promptNames.has('diagnose-flakiness')).toBe(true);

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

  describe('MCP 2026-07-28 Stateless Wire Protocol & Discovery', () => {
    it('server/discover returns protocolVersion 2026-07-28, capabilities, and serverInfo without handshake', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'server/discover',
        }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(1);
      expect(data.result).toBeDefined();
      expect(data.result?.protocolVersion).toBe('2026-07-28');
      expect(data.result?.serverInfo?.name).toBe('sdet-mcp');
      expect(data.result?.capabilities).toBeDefined();
    });

    it('server/discover via Mcp-Method header returns 2026-07-28 discovery payload', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'server/discover',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
        }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.protocolVersion).toBe('2026-07-28');
    });

    it('resources/list and resources/read - exposes Selenium, Cypress and SDET documentation as Resources', async () => {
      // List resources
      const listRes = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 10, method: 'resources/list' }),
      });
      expect(listRes.status).toBe(200);
      const listData = await parseMcpResponse(listRes);
      expect(listData.result).toBeDefined();

      const readRes = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 11,
          method: 'resources/read',
          params: { uri: 'sdet://guidelines' },
        }),
      });
      expect(readRes.status).toBe(200);
      const readData = await parseMcpResponse(readRes);
      expect(readData.result?.contents).toBeDefined();
      const contentText = readData.result?.contents?.[0]?.text || '';
      expect(contentText).toContain('Universal SDET Guidelines');
    });

    it('prompts/list and prompts/get - provides workflow prompts for test generation, migration, and diagnosis', async () => {
      const listRes = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 20, method: 'prompts/list' }),
      });
      expect(listRes.status).toBe(200);
      const listData = await parseMcpResponse(listRes);
      expect(listData.result?.prompts).toBeDefined();
      const promptNames = listData.result?.prompts?.map((p) => p.name) || [];
      expect(promptNames).toContain('generate-test');
      expect(promptNames).toContain('migrate-test');
      expect(promptNames).toContain('diagnose-flakiness');

      // Get generate-test prompt
      const getRes = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 21,
          method: 'prompts/get',
          params: {
            name: 'generate-test',
            arguments: {
              framework: 'cypress',
              language: 'typescript',
              featureDescription: 'User login with MFA verification',
            },
          },
        }),
      });
      expect(getRes.status).toBe(200);
      const getData = await parseMcpResponse(getRes);
      expect(getData.result?.messages).toBeDefined();
      const promptMsg = getData.result?.messages?.[0]?.content?.text || '';
      expect(promptMsg).toContain('User login with MFA verification');
    });

    it('tools/list returns all registered Selenium & Cypress tools with safety annotations', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/list' }),
      });

      expect(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.jsonrpc).toBe('2.0');
      expect(data.id).toBe(3);
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

    it('tools/call - read_se_locator_docs returns CacheableResult (ttlMs, cacheScope)', async () => {
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
      expect(data.result?.ttlMs).toBe(3600000);
      expect(data.result?.cacheScope).toBe('global');
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
      expect(data.result?.ttlMs).toBe(3600000);
      expect(data.result?.cacheScope).toBe('global');
      const text = data.result?.content?.[0]?.text || '';
      expect(text).toContain('cy.get');
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

    it('cors preflight - verifies MCP 2026-07-28 headers and absence of obsolete x-mcp-session-id', async () => {
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
      const allowHeaders = res.headers.get('access-control-allow-headers') || '';
      expect(allowHeaders).toContain('Mcp-Method');
      expect(allowHeaders).toContain('Mcp-Name');
      expect(allowHeaders).not.toContain('x-mcp-session-id');
    });
  });
});
