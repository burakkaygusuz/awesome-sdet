import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { mcpFetch, parseMcpResponse, listenServer, closeServer } from './helpers.js';
import { createHttpServer } from '../dist/index.js';
import http from 'node:http';

describe('MCP 2026-07-28 Primitives (tools / resources / prompts)', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createHttpServer();
    url = await listenServer(server);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe('server/discover', () => {
    it('returns protocolVersion 2026-07-28, capabilities, and serverInfo', async () => {
      const res = await mcpFetch(url, { jsonrpc: '2.0', id: 1, method: 'server/discover' });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.jsonrpc).toBe('2.0');
      expect.soft(data.id).toBe(1);
      expect.soft(data.result?.protocolVersion).toBe('2026-07-28');
      expect.soft(data.result?.serverInfo?.name).toBe('sdet-mcp');
      expect.soft(data.result?.capabilities).toBeDefined();
    });

    it('resolves via Mcp-Method header when body has no method field', async () => {
      const { MCP_HEADERS } = await import('./helpers.js');
      const res = await fetch(url, {
        method: 'POST',
        headers: { ...MCP_HEADERS, 'Mcp-Method': 'server/discover' },
        body: JSON.stringify({ jsonrpc: '2.0', id: 2 }),
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.protocolVersion).toBe('2026-07-28');
    });
  });

  describe('tools', () => {
    it('tools/list returns registered tools with readOnlyHint annotations', async () => {
      const res = await mcpFetch(url, { jsonrpc: '2.0', id: 3, method: 'tools/list' });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.jsonrpc).toBe('2.0');
      expect.soft(data.id).toBe(3);
      const tools = data.result?.tools || [];
      expect.soft(tools.length).toBeGreaterThanOrEqual(1);
      for (const tool of tools) {
        expect.soft(typeof tool.name).toBe('string');
        expect.soft(tool.annotations).toBeDefined();
        expect.soft(tool.annotations?.readOnlyHint).toBe(true);
      }
    });

    it('tools/call returns CacheableResult (ttlMs, cacheScope) for documentation tools', async () => {
      const listData = await parseMcpResponse(
        await mcpFetch(url, { jsonrpc: '2.0', id: 30, method: 'tools/list' })
      );
      const tools = listData.result?.tools || [];
      expect.soft(tools.length).toBeGreaterThanOrEqual(1);

      const docTool = tools.find((t) => t.name.startsWith('read_')) || tools[0];
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 40,
        method: 'tools/call',
        params: { name: docTool.name, arguments: {} },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.ttlMs).toBe(3600000);
      expect.soft(data.result?.cacheScope).toBe('global');
      expect.soft(Array.isArray(data.result?.content)).toBe(true);
    });

    it('tools/call returns isError: true for invalid arguments', async () => {
      const listData = await parseMcpResponse(
        await mcpFetch(url, { jsonrpc: '2.0', id: 50, method: 'tools/list' })
      );
      const tools = listData.result?.tools || [];
      const targetTool = tools[0];

      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 51,
        method: 'tools/call',
        params: {
          name: targetTool.name,
          arguments: { language: '__invalid_unsupported_language__' },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBe(true);
      expect.soft((data.result?.content?.[0]?.text || '').length).toBeGreaterThan(0);
    });
  });

  describe('resources', () => {
    it('resources/list and resources/read return registered resource content', async () => {
      const listRes = await mcpFetch(url, { jsonrpc: '2.0', id: 10, method: 'resources/list' });
      expect.soft(listRes.status).toBe(200);
      const listData = await parseMcpResponse(listRes);
      expect.soft(listData.result).toBeDefined();

      const readRes = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 11,
        method: 'resources/read',
        params: { uri: 'sdet://guidelines' },
      });
      expect.soft(readRes.status).toBe(200);
      const readData = await parseMcpResponse(readRes);
      expect.soft(readData.result?.contents).toBeDefined();
      expect.soft((readData.result?.contents?.[0]?.text || '').length).toBeGreaterThan(0);
    });
  });

  describe('prompts', () => {
    it('prompts/list and prompts/get dynamically serve workflow prompts', async () => {
      const listRes = await mcpFetch(url, { jsonrpc: '2.0', id: 20, method: 'prompts/list' });
      expect.soft(listRes.status).toBe(200);
      const listData = await parseMcpResponse(listRes);
      const prompts = listData.result?.prompts || [];
      expect.soft(prompts.length).toBeGreaterThanOrEqual(1);

      const targetPrompt = prompts[0];
      const getRes = await mcpFetch(url, {
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
      });
      expect.soft(getRes.status).toBe(200);
      const getData = await parseMcpResponse(getRes);
      expect.soft(getData.result?.messages).toBeDefined();
      expect.soft((getData.result?.messages?.[0]?.content?.text || '').length).toBeGreaterThan(0);
    });
  });
});
