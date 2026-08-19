import type http from 'node:http';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createHttpServer } from '../../servers/src/index.js';
import { FRAMEWORK_IDS, FRAMEWORK_REGISTRY } from '../../servers/src/registry.js';
import { closeServer, listenServer, mcpFetch, parseMcpResponse } from '../helpers.js';

describe('framework registry contract', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createHttpServer();
    url = await listenServer(server);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  it('matches registered tools and resource URI templates', async () => {
    const response = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    });
    const data = await parseMcpResponse(response);
    const toolNames = new Set((data.result?.tools ?? []).map((tool) => tool.name));

    expect(toolNames.size).toBe(5);
    expect(toolNames).toEqual(
      new Set([
        'read_pw_docs',
        'read_se_docs',
        'read_cy_docs',
        'read_vibium_docs',
        'read_appium_docs',
      ])
    );

    for (const framework of FRAMEWORK_IDS) {
      const definition = FRAMEWORK_REGISTRY[framework];

      expect(definition.resourceUri).toBe(`${framework}://{domain}/{language}`);
      for (const toolName of definition.toolNames) {
        expect(toolNames).toContain(toolName);
      }
    }
  });

  it('keeps every tool description within the 120-character dispatch budget (guide §4.1)', async () => {
    const response = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/list',
    });
    const data = await parseMcpResponse(response);
    const tools = data.result?.tools ?? [];

    const offenders = tools
      .filter((tool) => (tool.description ?? '').length > 120)
      .map((tool) => `${tool.name}: ${(tool.description ?? '').length} chars`);

    expect(offenders).toEqual([]);
  });
});
