import type http from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createHttpServer } from '../../servers/src/index.js';
import { mcpFetch, parseMcpResponse } from '../helpers.js';

describe('MCP 2026-07-28 Streamable HTTP Client Integration', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createHttpServer();
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const address = server.address() as AddressInfo;
    url = `http://127.0.0.1:${address.port}/mcp`;
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) =>
      server.close((error?: Error) => (error ? reject(error) : resolve()))
    );
  });

  it('discovers server, lists primitives, and executes a tool via pure 2026-07-28 streamable HTTP', async () => {
    // 1. server/discover
    const discoverRes = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 1,
      method: 'server/discover',
    });
    expect.soft(discoverRes.status).toBe(200);
    const discoverData = await parseMcpResponse(discoverRes);
    expect.soft(discoverData.result?.protocolVersion).toBe('2026-07-28');
    expect.soft(discoverData.result?.serverInfo?.name).toBe('sdet-mcp');

    // 2. tools/list
    const toolsRes = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    });
    expect.soft(toolsRes.status).toBe(200);
    const toolsData = await parseMcpResponse(toolsRes);
    const tools = toolsData.result?.tools || [];
    expect.soft(tools.length).toBeGreaterThanOrEqual(1);

    // 3. prompts/list
    const promptsRes = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 3,
      method: 'prompts/list',
    });
    expect.soft(promptsRes.status).toBe(200);
    const promptsData = await parseMcpResponse(promptsRes);
    expect.soft(promptsData.result?.prompts?.length).toBeGreaterThanOrEqual(1);

    // 4. tools/call
    const targetTool = tools[0];
    const callRes = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: { name: targetTool.name, arguments: {} },
    });
    expect.soft(callRes.status).toBe(200);
    const callData = await parseMcpResponse(callRes);
    expect.soft(Array.isArray(callData.result?.content)).toBe(true);
  });
});
