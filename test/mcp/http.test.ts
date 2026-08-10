import type http from 'node:http';
import type { AddressInfo } from 'node:net';

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createHttpServer } from '../../servers/dist/index.js';

describe('MCP SDK Client Integration', () => {
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

  // SDK Client Integration test — skipped pending SDK 2026-07-28 support.
  it.skip('connects, lists primitives, and executes a tool without static snapshots', async () => {
    const transport = new StreamableHTTPClientTransport(new URL(url));
    const client = new Client({ name: 'test-sdk-client', version: '1.0.0' });

    await client.connect(transport);

    const toolsResponse = await client.listTools();
    expect.soft(toolsResponse.tools.length).toBeGreaterThanOrEqual(1);
    for (const tool of toolsResponse.tools) {
      expect.soft(typeof tool.name).toBe('string');
      expect.soft(tool.name.length).toBeGreaterThanOrEqual(1);
    }

    const promptsResponse = await client.listPrompts();
    expect.soft(promptsResponse.prompts.length).toBeGreaterThanOrEqual(1);
    for (const prompt of promptsResponse.prompts) {
      expect.soft(typeof prompt.name).toBe('string');
    }

    const targetTool = toolsResponse.tools[0];
    const callResponse = await client.callTool({ name: targetTool.name, arguments: {} });
    expect.soft(callResponse).toBeDefined();
    expect.soft(Array.isArray(callResponse.content)).toBe(true);

    await client.close();
  });
});
