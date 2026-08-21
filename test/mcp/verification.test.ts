import type http from 'node:http';

import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createHttpServer } from '../../servers/src/index.js';
import { closeServer, listenServer, mcpFetch, parseMcpResponse } from '../helpers.js';

describe('MCP verify_test_artifact Tool', () => {
  let server: http.Server;
  let url: string;

  beforeAll(async () => {
    server = createHttpServer();
    url = await listenServer(server);
  });

  afterAll(async () => {
    await closeServer(server);
  });

  it('exposes verify_test_artifact metadata and annotations in tools/list', async () => {
    const res = await mcpFetch(url, { jsonrpc: '2.0', id: 1, method: 'tools/list' });
    expect.soft(res.status).toBe(200);

    const data = await parseMcpResponse(res);
    const verifyTool = data.result?.tools?.find(
      (t: { name: string }) => t.name === 'verify_test_artifact'
    );
    expect(verifyTool).toBeDefined();
    expect(verifyTool?.annotations?.readOnlyHint).toBe(true);
    expect(verifyTool?.inputSchema).toBeDefined();
    expect(verifyTool?.outputSchema).toBeDefined();
  });

  it('executes verify_test_artifact with clean code and returns passed: true', async () => {
    const res = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'verify_test_artifact',
        arguments: {
          framework: 'playwright',
          language: 'typescript',
          code: `
            import { test, expect } from '@playwright/test';
            test('clean spec', async ({ page }) => {
              await page.goto('/login');
              await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
            });
          `,
        },
      },
    });

    expect.soft(res.status).toBe(200);
    const data = await parseMcpResponse(res);
    expect.soft(data.result?.isError).toBeUndefined();

    const structured = data.result?.structuredContent as { passed: boolean; score: number };
    expect(structured).toBeDefined();
    expect(structured.passed).toBe(true);
    expect(structured.score).toBe(100);
  });

  it('executes verify_test_artifact with flawed code and returns failing score with actionable hints', async () => {
    const res = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'verify_test_artifact',
        arguments: {
          framework: 'playwright',
          language: 'typescript',
          code: `
            test('flawed test', async ({ page }) => {
              await page.goto('/login');
              await page.waitForTimeout(3000);
              await page.locator('//html/body/div/button').click();
            });
          `,
        },
      },
    });

    expect.soft(res.status).toBe(200);
    const data = await parseMcpResponse(res);
    expect.soft(data.result?.isError).toBeUndefined();

    const structured = data.result?.structuredContent as {
      passed: boolean;
      score: number;
      actionableHints: string[];
    };
    expect(structured.passed).toBe(false);
    expect(structured.score).toBeLessThan(100);
    expect(structured.actionableHints.some((h) => h.includes('[no-arbitrary-waits]'))).toBe(true);
  });

  it('returns SEP-1303 actionable error when invalid arguments or empty code are passed', async () => {
    const invalidFwRes = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'verify_test_artifact',
        arguments: { framework: 'unsupported-framework', code: 'expect(true).toBe(true);' },
      },
    });
    const invalidFwData = await parseMcpResponse(invalidFwRes);
    expect(invalidFwData.result?.isError).toBe(true);

    const emptyCodeRes = await mcpFetch(url, {
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'verify_test_artifact',
        arguments: { framework: 'playwright', code: '' },
      },
    });
    const emptyCodeData = await parseMcpResponse(emptyCodeRes);
    expect(emptyCodeData.result?.isError).toBe(true);
  });
});
