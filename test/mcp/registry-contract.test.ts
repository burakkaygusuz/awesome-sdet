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

    for (const framework of FRAMEWORK_IDS) {
      const definition = FRAMEWORK_REGISTRY[framework];

      expect(definition.resourceUri).toBe(`${framework}://{domain}/{language}`);
      for (const toolName of definition.toolNames) {
        expect(toolNames).toContain(toolName);
      }
    }
  });
});
