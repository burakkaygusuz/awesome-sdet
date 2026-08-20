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

  it('matches registered tools and framework registry contract', async () => {
    const response = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/list',
    });
    const data = await parseMcpResponse(response);
    const toolNames = new Set((data.result?.tools ?? []).map((tool) => tool.name));

    expect(toolNames.size).toBe(6);
    expect(toolNames).toEqual(
      new Set([
        'read_pw_docs',
        'read_se_docs',
        'read_cy_docs',
        'read_vibium_docs',
        'read_appium_docs',
        'verify_test_artifact',
      ])
    );

    for (const framework of FRAMEWORK_IDS) {
      const definition = FRAMEWORK_REGISTRY[framework];
      expect(definition.domains.length).toBeGreaterThan(0);
      expect(definition.languages.length).toBeGreaterThan(0);
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

  it('successfully loads reference docs for all registered framework, domain, and language combinations', async () => {
    let callId = 100;
    for (const framework of FRAMEWORK_IDS) {
      const definition = FRAMEWORK_REGISTRY[framework];
      const toolName = definition.toolNames[0];

      for (const domain of definition.domains) {
        for (const language of definition.languages) {
          callId++;
          const response = await mcpFetch(url, {
            jsonrpc: '2.0',
            id: callId,
            method: 'tools/call',
            params: {
              name: toolName,
              arguments: { domain, language },
            },
          });

          const data = await parseMcpResponse(response);
          expect.soft(data.error).toBeUndefined();
          expect.soft(data.result?.isError).toBeFalsy();

          const content = data.result?.content?.[0]?.text;
          expect.soft(content).toBeDefined();
          expect.soft(typeof content).toBe('string');
          expect.soft(content?.length).toBeGreaterThan(50);

          const structured = data.result?.structuredContent as
            | {
                framework: string;
                domain: string;
                language: string;
                title: string;
                codeSnippets: unknown[];
              }
            | undefined;

          expect.soft(structured).toBeDefined();
          expect.soft(structured?.framework).toBe(framework);
          expect.soft(structured?.domain).toBe(domain);
          expect.soft(structured?.language).toBe(language);
          expect.soft(structured?.codeSnippets.length).toBeGreaterThan(0);
        }
      }
    }
  });
});
