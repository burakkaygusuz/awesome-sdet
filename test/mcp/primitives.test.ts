import type http from 'node:http';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createHttpServer } from '../../servers/src/index.js';
import { closeServer, listenServer, mcpFetch, parseMcpResponse } from '../helpers.js';

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
      const { MCP_HEADERS } = await import('../helpers.js');
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
    it('tools/list returns registered tools with complete safe read-only annotations', async () => {
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
        expect.soft(tool.annotations?.destructiveHint).toBe(false);
        expect.soft(tool.annotations?.idempotentHint).toBe(true);
        expect.soft(tool.annotations?.openWorldHint).toBe(false);

        expect.soft(tool.outputSchema).toBeDefined();
        const schemaProps = (tool.outputSchema?.properties ?? {}) as Record<string, unknown>;
        expect.soft(tool.outputSchema?.type).toBe('object');
        expect.soft(schemaProps.framework).toBeDefined();
        expect.soft(schemaProps.codeSnippets).toBeDefined();
      }
    });

    it('tools/call returns CacheableResult (ttlMs, cacheScope) and dual-output (content + structuredContent) for documentation tools', async () => {
      const listData = await parseMcpResponse(
        await mcpFetch(url, { jsonrpc: '2.0', id: 30, method: 'tools/list' })
      );
      const tools = listData.result?.tools || [];
      expect.soft(tools.length).toBeGreaterThanOrEqual(1);

      const docTool = tools.find((t: { name: string }) => t.name.startsWith('read_')) || tools[0];
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 40,
        method: 'tools/call',
        params: { name: docTool.name, arguments: { domain: 'locators', language: 'typescript' } },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.ttlMs).toBe(3600000);
      expect.soft(data.result?.cacheScope).toBe('public');
      expect.soft(Array.isArray(data.result?.content)).toBe(true);
      expect.soft((data.result?.content?.[0]?.text || '').length).toBeGreaterThan(0);

      const structured = data.result?.structuredContent as
        | {
            framework?: string;
            domain?: string;
            language?: string;
            title?: string;
            codeSnippets?: Array<{ language: string; code: string }>;
            rawMarkdown?: string;
          }
        | undefined;
      expect.soft(structured).toBeDefined();
      expect.soft(typeof structured?.framework).toBe('string');
      expect.soft(structured?.domain).toBe('locators');
      expect.soft(structured?.language).toBe('typescript');
      expect.soft(typeof structured?.title).toBe('string');
      expect.soft(Array.isArray(structured?.codeSnippets)).toBe(true);
      expect.soft(structured?.codeSnippets?.length).toBeGreaterThanOrEqual(1);
      expect.soft(typeof structured?.rawMarkdown).toBe('string');
    });

    it('tools/call returns isError: true and informative self-correction message for invalid arguments (SEP-1303)', async () => {
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
          arguments: {
            domain: '__invalid_unsupported_domain__',
            language: '__invalid_unsupported_language__',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBe(true);
      expect.soft((data.result?.content?.[0]?.text || '').length).toBeGreaterThan(0);
      expect.soft(data.result?.content?.[0]?.text).not.toContain('Reference:');
    });

    it('tools/call rejects unrecognized hallucinated arguments via .strict() schema', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 52,
        method: 'tools/call',
        params: {
          name: 'read_vibium_docs',
          arguments: {
            domain: 'core',
            language: 'typescript',
            unrecognized_hallucinated_param: 'unexpected',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBe(true);
    });

    it('tools/call successfully executes documentation tools across all supported frameworks', async () => {
      const crossFrameworkTools = [
        { name: 'read_pw_docs', domain: 'locators', lang: 'typescript', expectText: 'Playwright' },
        { name: 'read_pw_docs', domain: 'actions', lang: 'python', expectText: 'Playwright' },
        { name: 'read_pw_docs', domain: 'assertions', lang: 'java', expectText: 'Playwright' },
        { name: 'read_pw_docs', domain: 'network', lang: 'csharp', expectText: 'Playwright' },
        { name: 'read_pw_docs', domain: 'storage', lang: 'typescript', expectText: 'Playwright' },
        { name: 'read_pw_docs', domain: 'observability', lang: 'python', expectText: 'Playwright' },
        { name: 'read_se_docs', domain: 'actions', lang: 'java', expectText: 'Selenium' },
        { name: 'read_se_docs', domain: 'bidi', lang: 'python', expectText: 'Selenium' },
        { name: 'read_cy_docs', domain: 'commands', lang: 'typescript', expectText: 'Cypress' },
        { name: 'read_vibium_docs', domain: 'core', lang: 'python', expectText: 'Vibium' },
        { name: 'read_vibium_docs', domain: 'selectors', lang: 'typescript', expectText: 'Vibium' },
        { name: 'read_vibium_docs', domain: 'interactions', lang: 'java', expectText: 'Vibium' },
        { name: 'read_vibium_docs', domain: 'bidi', lang: 'javascript', expectText: 'Vibium' },
        { name: 'read_vibium_docs', domain: 'state', lang: 'typescript', expectText: 'Vibium' },
        {
          name: 'read_appium_docs',
          domain: 'capabilities',
          lang: 'typescript',
          expectText: 'Appium',
        },
        { name: 'read_appium_docs', domain: 'locators', lang: 'python', expectText: 'Appium' },
        { name: 'read_appium_docs', domain: 'gestures', lang: 'java', expectText: 'Appium' },
        { name: 'read_appium_docs', domain: 'context', lang: 'csharp', expectText: 'Appium' },
        { name: 'read_appium_docs', domain: 'device', lang: 'javascript', expectText: 'Appium' },
      ];

      for (const item of crossFrameworkTools) {
        const res = await mcpFetch(url, {
          jsonrpc: '2.0',
          id: 60,
          method: 'tools/call',
          params: { name: item.name, arguments: { domain: item.domain, language: item.lang } },
        });

        expect.soft(res.status).toBe(200);
        const data = await parseMcpResponse(res);
        expect.soft(data.result?.isError).toBeUndefined();
        expect.soft(data.result?.content?.[0]?.text).toContain(item.expectText);
      }
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

    it('resources/read dynamically fetches resources across all framework templates', async () => {
      const templates = [
        { uri: 'playwright://locators/typescript', expectText: 'Playwright' },
        { uri: 'selenium://actions/typescript', expectText: 'Selenium' },
        { uri: 'selenium://bidi/python', expectText: 'Selenium' },
        { uri: 'cypress://commands/typescript', expectText: 'Cypress' },
        { uri: 'vibium://core/typescript', expectText: 'Vibium Core' },
        { uri: 'appium://capabilities/typescript', expectText: 'Appium' },
      ];

      for (const t of templates) {
        const readRes = await mcpFetch(url, {
          jsonrpc: '2.0',
          id: 12,
          method: 'resources/read',
          params: { uri: t.uri },
        });
        expect.soft(readRes.status).toBe(200);
        const readData = await parseMcpResponse(readRes);
        expect.soft(readData.result?.contents).toBeDefined();
        expect.soft(readData.result?.contents?.[0]?.text).toContain(t.expectText);
      }
    });

    it('resources/read returns JSON-RPC error -32602 when resource is not found across all framework templates', async () => {
      const invalidUris = [
        'playwright://not-a-real-domain/typescript',
        'selenium://not-a-real-domain/typescript',
        'cypress://not-a-real-domain/typescript',
        'vibium://not-a-real-domain/typescript',
        'appium://not-a-real-domain/typescript',
      ];

      for (const uri of invalidUris) {
        const readRes = await mcpFetch(url, {
          jsonrpc: '2.0',
          id: 13,
          method: 'resources/read',
          params: { uri },
        });
        const readData = await parseMcpResponse(readRes);
        expect.soft(readData.error).toBeDefined();
        expect.soft(readData.error?.code).toBe(-32602);
        expect.soft(readData.error?.message).toContain('Resource not found');
        expect.soft(readData.result).toBeUndefined();
      }
    });
  });

  describe('prompts', () => {
    it('prompts/list and prompts/get dynamically serve workflow prompts', async () => {
      const listRes = await mcpFetch(url, { jsonrpc: '2.0', id: 20, method: 'prompts/list' });
      expect.soft(listRes.status).toBe(200);
      const listData = await parseMcpResponse(listRes);
      const prompts = listData.result?.prompts || [];
      expect.soft(prompts.length).toBe(3);

      const promptNames = prompts.map((p: { name: string }) => p.name);
      expect.soft(promptNames).toContain('generate-test');
      expect.soft(promptNames).toContain('migrate-test');
      expect.soft(promptNames).toContain('diagnose-flakiness');

      const genRes = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 21,
        method: 'prompts/get',
        params: {
          name: 'generate-test',
          arguments: {
            framework: 'vibium',
            language: 'typescript',
            featureDescription: 'Dynamic user authentication test with biometric MFA',
          },
        },
      });
      expect.soft(genRes.status).toBe(200);
      const genData = await parseMcpResponse(genRes);
      expect.soft(genData.result?.messages).toBeDefined();
      expect.soft(genData.result?.messages?.[0]?.content?.text).toContain('vibium');
      expect.soft(genData.result?.messages?.[0]?.content?.text).toContain('skills/sdet-*');
      expect.soft(genData.result?.messages?.[0]?.content?.text).toContain('resources/read');
      expect
        .soft(genData.result?.messages?.[0]?.content?.text)
        .toContain('vibium://{domain}/{language}');
      expect.soft(genData.result?.messages?.[0]?.content?.text).toContain('read_vibium_docs');
      expect(genData.result?.messages?.[0]?.content?.text).not.toContain(
        'skills/sdet-*/references'
      );

      const pwGenRes = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 25,
        method: 'prompts/get',
        params: {
          name: 'generate-test',
          arguments: {
            framework: 'playwright',
            language: 'typescript',
            featureDescription: 'User checkout journey with credit card payment',
          },
        },
      });
      expect.soft(pwGenRes.status).toBe(200);
      const pwGenData = await parseMcpResponse(pwGenRes);
      expect.soft(pwGenData.result?.messages).toBeDefined();
      expect.soft(pwGenData.result?.messages?.[0]?.content?.text).toContain('playwright');
      expect.soft(pwGenData.result?.messages?.[0]?.content?.text).toContain('skills/sdet-*');
      expect
        .soft(pwGenData.result?.messages?.[0]?.content?.text)
        .toContain('playwright://{domain}/{language}');
      expect.soft(pwGenData.result?.messages?.[0]?.content?.text).toContain('read_pw_docs');

      const migRes = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 22,
        method: 'prompts/get',
        params: {
          name: 'migrate-test',
          arguments: {
            sourceFramework: 'selenium',
            targetFramework: 'cypress',
            sourceCode: 'cy.visit("/login"); cy.get("#submit").click();',
          },
        },
      });
      expect.soft(migRes.status).toBe(200);
      const migData = await parseMcpResponse(migRes);
      expect
        .soft(migData.result?.messages?.[0]?.content?.text)
        .toContain('Anti-Pattern Elimination');
      expect
        .soft(migData.result?.messages?.[0]?.content?.text)
        .toContain('cypress://{domain}/{language}');
      expect.soft(migData.result?.messages?.[0]?.content?.text).toContain('read_cy_docs');

      const diagRes = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 23,
        method: 'prompts/get',
        params: {
          name: 'diagnose-flakiness',
          arguments: {
            framework: 'selenium',
            failureLog:
              'StaleElementReferenceException: element is not attached to the page document',
            testCode: 'driver.findElement(By.id("btn")).click();',
          },
        },
      });
      expect.soft(diagRes.status).toBe(200);
      const diagData = await parseMcpResponse(diagRes);
      expect.soft(diagData.result?.messages?.[0]?.content?.text).toContain('Phase 1 - Trace');
    });

    it('prompts/get rejects invalid framework or language enums via Zod v4 schema', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 24,
        method: 'prompts/get',
        params: {
          name: 'generate-test',
          arguments: {
            framework: '__invalid_framework__',
            language: 'typescript',
            featureDescription: 'Valid feature description with enough length',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.error).toBeDefined();
    });
  });
});
