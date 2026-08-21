import type http from 'node:http';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createHttpServer } from '../../servers/src/index.js';
import { FRAMEWORK_IDS, FRAMEWORK_REGISTRY } from '../../servers/src/registry.js';
import { closeServer, listenServer, mcpFetch, parseMcpResponse } from '../helpers.js';

describe('Universal SDET Documentation Gateway (read_sdet_docs)', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createHttpServer();
    url = await listenServer(server);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  describe('tools/list metadata and schemas', () => {
    it('returns read_sdet_docs with title, 120-char description budget, annotations, and schemas', async () => {
      const res = await mcpFetch(url, { jsonrpc: '2.0', id: 1, method: 'tools/list' });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.jsonrpc).toBe('2.0');
      expect.soft(data.id).toBe(1);

      const tools = data.result?.tools || [];
      const docsTool = tools.find((t: { name: string }) => t.name === 'read_sdet_docs');
      expect(docsTool).toBeDefined();

      expect.soft(docsTool?.name).toBe('read_sdet_docs');
      expect
        .soft((docsTool as { title?: string })?.title)
        .toBe('Universal SDET Documentation Gateway');
      expect
        .soft(docsTool?.description)
        .toBe(
          'Retrieves progressive reference documentation, API patterns, and code snippets across all test automation frameworks.'
        );
      expect.soft((docsTool?.description || '').length).toBeLessThanOrEqual(120);

      expect.soft(docsTool?.annotations).toBeDefined();
      expect.soft(docsTool?.annotations?.readOnlyHint).toBe(true);
      expect.soft(docsTool?.annotations?.destructiveHint).toBe(false);
      expect.soft(docsTool?.annotations?.idempotentHint).toBe(true);
      expect.soft(docsTool?.annotations?.openWorldHint).toBe(false);

      expect.soft(docsTool?.inputSchema).toBeDefined();
      const inputSchema = docsTool?.inputSchema as {
        type?: string;
        properties?: Record<string, unknown>;
        required?: string[];
      };
      expect.soft(inputSchema.type).toBe('object');
      expect.soft(inputSchema.properties?.framework).toBeDefined();
      expect.soft(inputSchema.properties?.domain).toBeDefined();
      expect.soft(inputSchema.properties?.language).toBeDefined();
      expect.soft(inputSchema.properties?.query).toBeDefined();
      expect.soft(inputSchema.required).toContain('framework');
      expect.soft(inputSchema.required).toContain('domain');

      expect.soft(docsTool?.outputSchema).toBeDefined();
      const outputSchema = docsTool?.outputSchema as {
        type?: string;
        properties?: Record<string, unknown>;
        required?: string[];
      };
      expect.soft(outputSchema.type).toBe('object');
      expect.soft(outputSchema.properties?.framework).toBeDefined();
      expect.soft(outputSchema.properties?.domain).toBeDefined();
      expect.soft(outputSchema.properties?.language).toBeDefined();
      expect.soft(outputSchema.properties?.title).toBeDefined();
      expect.soft(outputSchema.properties?.matchedSections).toBeDefined();
      expect.soft(outputSchema.properties?.codeSnippets).toBeDefined();
    });
  });

  describe('tools/call doc retrieval across frameworks', () => {
    it('successfully retrieves Playwright docs and returns DocsOutputSchema-compliant structuredContent and caching metadata', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 10,
        method: 'tools/call',
        params: {
          name: 'read_sdet_docs',
          arguments: {
            framework: 'playwright',
            domain: 'locators',
            language: 'typescript',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBeUndefined();
      expect.soft(data.result?.ttlMs).toBe(3600000);
      expect.soft(data.result?.cacheScope).toBe('public');

      const content = data.result?.content;
      expect.soft(Array.isArray(content)).toBe(true);
      expect.soft(content?.[0]?.type).toBe('text');
      expect.soft(content?.[0]?.text).toContain('Playwright');

      const structured = data.result?.structuredContent as
        | {
            framework: string;
            domain: string;
            language: string;
            title: string;
            matchedSections: string[];
            codeSnippets: Array<{ language: string; code: string }>;
          }
        | undefined;

      expect(structured).toBeDefined();
      expect.soft(structured?.framework).toBe('playwright');
      expect.soft(structured?.domain).toBe('locators');
      expect.soft(structured?.language).toBe('typescript');
      expect.soft(typeof structured?.title).toBe('string');
      expect.soft(Array.isArray(structured?.matchedSections)).toBe(true);
      expect.soft(structured?.matchedSections.length).toBeGreaterThan(0);
      expect.soft(Array.isArray(structured?.codeSnippets)).toBe(true);
      expect.soft(structured?.codeSnippets.length).toBeGreaterThan(0);
    });

    it('successfully retrieves Cypress docs with default language fallback when language is omitted', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 11,
        method: 'tools/call',
        params: {
          name: 'read_sdet_docs',
          arguments: {
            framework: 'cypress',
            domain: 'commands',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBeUndefined();

      const structured = data.result?.structuredContent as {
        framework: string;
        domain: string;
        language: string;
      };
      expect(structured).toBeDefined();
      expect.soft(structured.framework).toBe('cypress');
      expect.soft(structured.domain).toBe('commands');
      expect.soft(structured.language).toBe('typescript');
    });

    it('successfully retrieves Selenium docs with default language (java) when language is omitted', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 12,
        method: 'tools/call',
        params: {
          name: 'read_sdet_docs',
          arguments: {
            framework: 'selenium',
            domain: 'actions',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBeUndefined();

      const structured = data.result?.structuredContent as {
        framework: string;
        domain: string;
        language: string;
      };
      expect(structured).toBeDefined();
      expect.soft(structured.framework).toBe('selenium');
      expect.soft(structured.domain).toBe('actions');
      expect.soft(structured.language).toBe('java');
    });

    it('retrieves docs for all supported frameworks', async () => {
      for (const framework of FRAMEWORK_IDS) {
        const config = FRAMEWORK_REGISTRY[framework];
        const res = await mcpFetch(url, {
          jsonrpc: '2.0',
          id: 20,
          method: 'tools/call',
          params: {
            name: 'read_sdet_docs',
            arguments: {
              framework,
              domain: config.defaultDomain,
              language: config.defaultLanguage,
            },
          },
        });

        expect.soft(res.status).toBe(200);
        const data = await parseMcpResponse(res);
        expect.soft(data.result?.isError).toBeUndefined();
        const content = data.result?.content?.[0]?.text || '';
        expect.soft(content.length).toBeGreaterThan(50);
      }
    });
  });

  describe('tools/call query filtering behavior', () => {
    it('filters markdown content and structuredContent codeSnippets to matched sections when query is present', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 30,
        method: 'tools/call',
        params: {
          name: 'read_sdet_docs',
          arguments: {
            framework: 'playwright',
            domain: 'locators',
            language: 'typescript',
            query: 'getByRole',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBeUndefined();

      const structured = data.result?.structuredContent as
        | {
            matchedSections: string[];
            query?: string;
            codeSnippets: Array<{ language: string; code: string }>;
          }
        | undefined;

      expect(structured).toBeDefined();
      expect.soft(structured?.query).toBe('getByRole');
      expect.soft(structured?.matchedSections).toContain('1. Recommended User-Facing Locators');
      expect.soft(structured?.codeSnippets.length).toBeGreaterThan(0);

      const content = data.result?.content?.[0]?.text || '';
      expect.soft(content).toContain('Filtered for: "getByRole"');
      expect.soft(content).toContain('getByRole');
    });

    it('returns empty matchedSections and helpful heading suggestions when query matches nothing', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 31,
        method: 'tools/call',
        params: {
          name: 'read_sdet_docs',
          arguments: {
            framework: 'playwright',
            domain: 'locators',
            language: 'typescript',
            query: 'non_existent_symbol_xyz_404',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBeUndefined();

      const structured = data.result?.structuredContent as {
        matchedSections: string[];
        codeSnippets: unknown[];
        query?: string;
      };
      expect(structured).toBeDefined();
      expect.soft(structured.query).toBe('non_existent_symbol_xyz_404');
      expect.soft(structured.matchedSections).toEqual([]);
      expect.soft(structured.codeSnippets).toEqual([]);

      const content = data.result?.content?.[0]?.text || '';
      expect
        .soft(content)
        .toContain('No sections found matching query "non_existent_symbol_xyz_404"');
      expect.soft(content).toContain('Available sections in this domain:');
    });
  });

  describe('SEP-1303 Actionable Error Directives', () => {
    it('returns actionable SEP-1303 error with available domains when unknown domain is requested', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 40,
        method: 'tools/call',
        params: {
          name: 'read_sdet_docs',
          arguments: {
            framework: 'playwright',
            domain: 'invalid_domain_xyz',
            language: 'typescript',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);

      const errorText = data.result?.content?.[0]?.text || '';
      expect.soft(errorText).toContain('Unsupported playwright domain:');
      expect.soft(errorText).toContain("'invalid_domain_xyz'");
      expect.soft(errorText).toContain('Supported domains:');
      expect.soft(errorText).toContain('locators');
      expect.soft(errorText).toContain('actions');
      expect.soft(errorText).not.toContain('Reference:');
    });

    it('returns actionable SEP-1303 error with supported languages when unsupported language is requested for that framework', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 41,
        method: 'tools/call',
        params: {
          name: 'read_sdet_docs',
          arguments: {
            framework: 'cypress',
            domain: 'commands',
            language: 'python',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);

      const errorText = data.result?.content?.[0]?.text || '';
      expect.soft(errorText).toContain('Unsupported cypress language:');
      expect.soft(errorText).toContain("'python'");
      expect.soft(errorText).toContain('Supported languages:');
      expect.soft(errorText).toContain('typescript');
      expect.soft(errorText).toContain('javascript');
      expect.soft(errorText).not.toContain('Reference:');
    });

    it('returns error when unsupported framework is requested', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 42,
        method: 'tools/call',
        params: {
          name: 'read_sdet_docs',
          arguments: {
            framework: 'unsupported_framework_xyz',
            domain: 'locators',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);
    });

    it('returns error when unknown properties are passed via strict schema', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 43,
        method: 'tools/call',
        params: {
          name: 'read_sdet_docs',
          arguments: {
            framework: 'playwright',
            domain: 'locators',
            unrecognizedParam: 'malicious',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);
    });
  });
});
