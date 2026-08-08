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
    it('connects, dynamically lists primitives (tools, resources, prompts), and executes without static snapshots', async () => {
      const transport = new StreamableHTTPClientTransport(new URL(url));
      const client = new Client({ name: 'test-sdk-client', version: '1.0.0' });

      await client.connect(transport);

      // Tools Primitive - Dynamic discovery
      const toolsResponse = await client.listTools();
      expect.soft(toolsResponse.tools.length).toBeGreaterThanOrEqual(1);

      for (const tool of toolsResponse.tools) {
        expect.soft(typeof tool.name).toBe('string');
        expect.soft(tool.name.length).toBeGreaterThanOrEqual(1);
      }

      // Prompts Primitive - Dynamic discovery
      const promptsResponse = await client.listPrompts();
      expect.soft(promptsResponse.prompts.length).toBeGreaterThanOrEqual(1);

      for (const prompt of promptsResponse.prompts) {
        expect.soft(typeof prompt.name).toBe('string');
      }

      // Execute first available tool dynamically
      const targetTool = toolsResponse.tools[0];
      const callResponse = await client.callTool({
        name: targetTool.name,
        arguments: {},
      });

      expect.soft(callResponse).toBeDefined();
      expect.soft(Array.isArray(callResponse.content)).toBe(true);

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

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.jsonrpc).toBe('2.0');
      expect.soft(data.id).toBe(1);
      expect.soft(data.result).toBeDefined();
      expect.soft(data.result?.protocolVersion).toBe('2026-07-28');
      expect.soft(data.result?.serverInfo?.name).toBe('sdet-mcp');
      expect.soft(data.result?.capabilities).toBeDefined();
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

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.protocolVersion).toBe('2026-07-28');
    });

    it('rejects Mcp-Method header / JSON-RPC body method mismatch with HTTP 400 and -32600', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'tools/call',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 90,
          method: 'tools/list',
        }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error).toBeDefined();
      expect.soft(data.error?.code).toBe(-32600);
      expect.soft(data.error?.message).toContain('Mcp-Method header');
    });

    it('rejects Mcp-Name header / params target mismatch with HTTP 400 and -32602', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Method': 'tools/call',
          'Mcp-Name': 'unexpected_tool_name',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 91,
          method: 'tools/call',
          params: {
            name: 'actual_tool_name',
          },
        }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error).toBeDefined();
      expect.soft(data.error?.code).toBe(-32602);
      expect.soft(data.error?.message).toContain('Mcp-Name header');
    });

    it('rejects unsupported protocol version with HTTP 400 and -32000', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          ...MCP_HEADERS,
          'Mcp-Protocol-Version': '2023-01-01',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 92,
          method: 'server/discover',
        }),
      });

      expect.soft(res.status).toBe(400);
      const data = await parseMcpResponse(res);
      expect.soft(data.error).toBeDefined();
      expect.soft(data.error?.code).toBe(-32000);
      expect.soft(data.error?.message).toContain('Unsupported protocol version');
    });

    it('SSE response path - GET /mcp returns text/event-stream with endpoint event', async () => {
      const sseData = await new Promise<string>((resolve, reject) => {
        const req = http.request(
          url,
          {
            method: 'GET',
            headers: {
              Accept: 'text/event-stream',
            },
          },
          (res) => {
            expect.soft(res.statusCode).toBe(200);
            expect.soft(res.headers['content-type']).toContain('text/event-stream');
            let body = '';
            res.on('data', (chunk) => {
              body += String(chunk);
              if (body.includes('event: endpoint')) {
                req.destroy();
                resolve(body);
              }
            });
          }
        );
        req.on('error', (err) => {
          if (
            err.message.includes('socket hang up') ||
            (err as { code?: string }).code === 'ECONNRESET'
          ) {
            return; // Expected upon req.destroy()
          }
          reject(err);
        });
        req.end();
      });

      expect.soft(sseData).toContain('event: endpoint');
      expect.soft(sseData).toContain('/mcp');
    });

    it('resources/list and resources/read - dynamically accesses registered Resources', async () => {
      const listRes = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 10, method: 'resources/list' }),
      });
      expect.soft(listRes.status).toBe(200);
      const listData = await parseMcpResponse(listRes);
      expect.soft(listData.result).toBeDefined();

      // Read SDET Universal Guidelines Resource
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
      expect.soft(readRes.status).toBe(200);
      const readData = await parseMcpResponse(readRes);
      expect.soft(readData.result?.contents).toBeDefined();
      const contentText = readData.result?.contents?.[0]?.text || '';
      expect.soft(contentText.length).toBeGreaterThan(0);
    });

    it('prompts/list and prompts/get - dynamically serves workflow prompts', async () => {
      const listRes = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 20, method: 'prompts/list' }),
      });
      expect.soft(listRes.status).toBe(200);
      const listData = await parseMcpResponse(listRes);
      expect.soft(listData.result?.prompts).toBeDefined();
      const prompts = listData.result?.prompts || [];
      expect.soft(prompts.length).toBeGreaterThanOrEqual(1);

      // Dynamically get the first registered prompt
      const targetPrompt = prompts[0];
      const getRes = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 21,
          method: 'prompts/get',
          params: {
            name: targetPrompt.name,
            arguments: {
              framework: 'cypress',
              language: 'typescript',
              featureDescription: 'Dynamic user authentication test',
            },
          },
        }),
      });
      expect.soft(getRes.status).toBe(200);
      const getData = await parseMcpResponse(getRes);
      expect.soft(getData.result?.messages).toBeDefined();
      const promptMsg = getData.result?.messages?.[0]?.content?.text || '';
      expect.soft(promptMsg.length).toBeGreaterThan(0);
    });

    it('tools/list returns registered tools with mandatory safety annotations', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 3, method: 'tools/list' }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.jsonrpc).toBe('2.0');
      expect.soft(data.id).toBe(3);
      expect.soft(data.result).toBeDefined();

      const tools = data.result?.tools || [];
      expect.soft(tools.length).toBeGreaterThanOrEqual(1);

      for (const tool of tools) {
        expect.soft(typeof tool.name).toBe('string');
        expect.soft(tool.annotations).toBeDefined();
        expect.soft(tool.annotations?.readOnlyHint).toBe(true);
      }
    });

    it('tools/call returns CacheableResult (ttlMs, cacheScope) for documentation tools', async () => {
      // Discover documentation tools dynamically
      const listRes = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 30, method: 'tools/list' }),
      });
      const listData = await parseMcpResponse(listRes);
      const tools = listData.result?.tools || [];
      expect.soft(tools.length).toBeGreaterThanOrEqual(1);

      const docTool = tools.find((t) => t.name.startsWith('read_')) || tools[0];
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 40,
          method: 'tools/call',
          params: {
            name: docTool.name,
            arguments: {},
          },
        }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.jsonrpc).toBe('2.0');
      expect.soft(data.id).toBe(40);
      expect.soft(data.result).toBeDefined();
      expect.soft(data.result?.ttlMs).toBe(3600000);
      expect.soft(data.result?.cacheScope).toBe('global');
      expect.soft(Array.isArray(data.result?.content)).toBe(true);
    });

    it('tools/call handles invalid arguments cleanly with isError: true', async () => {
      const listRes = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 50, method: 'tools/list' }),
      });
      const listData = await parseMcpResponse(listRes);
      const tools = listData.result?.tools || [];
      expect.soft(tools.length).toBeGreaterThanOrEqual(1);

      const targetTool = tools[0];
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 51,
          method: 'tools/call',
          params: {
            name: targetTool.name,
            arguments: {
              language: '__invalid_unsupported_language__',
            },
          },
        }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result).toBeDefined();
      expect.soft(data.result?.isError).toBe(true);
      const text = data.result?.content?.[0]?.text || '';
      expect.soft(text.length).toBeGreaterThan(0);
    });

    it('security headers - returns X-Content-Type-Options, X-Frame-Options, Referrer-Policy', async () => {
      const res = await fetch(url, {
        method: 'POST',
        headers: MCP_HEADERS,
        body: JSON.stringify({ jsonrpc: '2.0', id: 60, method: 'tools/list' }),
      });

      expect.soft(res.status).toBe(200);
      expect.soft(res.headers.get('x-content-type-options')).toBe('nosniff');
      expect.soft(res.headers.get('x-frame-options')).toBe('DENY');
      expect.soft(res.headers.get('referrer-policy')).toBe('no-referrer');
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
      expect.soft(statusCode).toBe(403);
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
      expect.soft(statusCode).toBe(403);
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
});
