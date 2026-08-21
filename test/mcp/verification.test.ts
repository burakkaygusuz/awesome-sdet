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

  describe('tools/list metadata and schemas', () => {
    it('returns verify_test_artifact with title, description, annotations, and schemas', async () => {
      const res = await mcpFetch(url, { jsonrpc: '2.0', id: 1, method: 'tools/list' });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.jsonrpc).toBe('2.0');
      expect.soft(data.id).toBe(1);

      const tools = data.result?.tools || [];
      const verifyTool = tools.find((t: { name: string }) => t.name === 'verify_test_artifact');
      expect(verifyTool).toBeDefined();

      expect.soft(verifyTool?.name).toBe('verify_test_artifact');
      expect
        .soft((verifyTool as { title?: string })?.title)
        .toBe('Deterministic Test Invariant Scanner');
      expect
        .soft(verifyTool?.description)
        .toBe(
          'Scans generated or migrated test code for flakiness, missing assertions, and anti-patterns.'
        );

      expect.soft(verifyTool?.annotations).toBeDefined();
      expect.soft(verifyTool?.annotations?.readOnlyHint).toBe(true);
      expect.soft(verifyTool?.annotations?.destructiveHint).toBe(false);
      expect.soft(verifyTool?.annotations?.idempotentHint).toBe(true);
      expect.soft(verifyTool?.annotations?.openWorldHint).toBe(false);

      expect.soft(verifyTool?.inputSchema).toBeDefined();
      const inputSchema = verifyTool?.inputSchema as {
        type?: string;
        properties?: Record<string, unknown>;
        required?: string[];
      };
      expect.soft(inputSchema.type).toBe('object');
      expect.soft(inputSchema.properties?.code).toBeDefined();
      expect.soft(inputSchema.properties?.framework).toBeDefined();
      expect.soft(inputSchema.properties?.language).toBeDefined();
      expect.soft(inputSchema.properties?.context).toBeDefined();
      expect.soft(inputSchema.required).toContain('code');
      expect.soft(inputSchema.required).toContain('framework');

      expect.soft(verifyTool?.outputSchema).toBeDefined();
      const outputSchema = verifyTool?.outputSchema as {
        type?: string;
        properties?: Record<string, unknown>;
        required?: string[];
      };
      expect.soft(outputSchema.type).toBe('object');
      expect.soft(outputSchema.properties?.passed).toBeDefined();
      expect.soft(outputSchema.properties?.score).toBeDefined();
      expect.soft(outputSchema.properties?.complianceScore).toBeDefined();
      expect.soft(outputSchema.properties?.qualityScore).toBeDefined();
      expect.soft(outputSchema.properties?.checks).toBeDefined();
      expect.soft(outputSchema.properties?.actionableHints).toBeDefined();
    });
  });

  describe('tools/call with clean code', () => {
    it('executes verify_test_artifact with clean Playwright code returning passed: true and score: 100', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 2,
        method: 'tools/call',
        params: {
          name: 'verify_test_artifact',
          arguments: {
            framework: 'playwright',
            language: 'typescript',
            context: 'user login spec',
            code: `
              import { test, expect } from '@playwright/test';

              test('login flow', async ({ page }) => {
                await page.goto('/login');
                await page.getByLabel('Username').fill('testuser');
                await page.getByRole('button', { name: 'Sign in' }).click();
                await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
              });
            `,
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBeUndefined();

      const structured = data.result?.structuredContent as
        | {
            passed: boolean;
            score: number;
            checks: Array<{ id: string; rule: string; passed: boolean; severity: string }>;
            actionableHints: string[];
          }
        | undefined;

      expect(structured).toBeDefined();
      expect.soft(structured?.passed).toBe(true);
      expect.soft(structured?.score).toBe(100);
      expect.soft(structured?.actionableHints).toEqual([]);
      expect.soft(structured?.checks).toHaveLength(4);
      expect.soft(structured?.checks.every((c) => c.passed)).toBe(true);

      const content = data.result?.content;
      expect.soft(Array.isArray(content)).toBe(true);
      expect.soft(content?.[0]?.text).toContain('PASSED');
      expect.soft(content?.[0]?.text).toContain('100/100');
    });

    it('executes verify_test_artifact with clean Cypress code returning passed: true', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'verify_test_artifact',
          arguments: {
            framework: 'cypress',
            language: 'typescript',
            code: `
              describe('Navigation', () => {
                it('navigates to settings', () => {
                  cy.visit('/dashboard');
                  cy.get('[data-testid="settings-link"]').click();
                  cy.get('[data-testid="settings-header"]').should('be.visible');
                });
              });
            `,
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBeUndefined();

      const structured = data.result?.structuredContent as { passed: boolean; score: number };
      expect(structured.passed).toBe(true);
      expect(structured.score).toBe(100);
    });

    it('executes verify_test_artifact with clean Selenium Java code returning passed: true', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'verify_test_artifact',
          arguments: {
            framework: 'selenium',
            language: 'java',
            code: `
              public class DashboardTest {
                private ThreadLocal<WebDriver> driver = new ThreadLocal<>();

                @Test
                public void testDashboard() {
                  driver.get().get("https://example.com");
                  WebElement title = driver.get().findElement(By.id("title"));
                  Assert.assertEquals("Example", title.getText());
                }
              }
            `,
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect.soft(data.result?.isError).toBeUndefined();

      const structured = data.result?.structuredContent as { passed: boolean; score: number };
      expect(structured.passed).toBe(true);
      expect(structured.score).toBe(100);
    });
  });

  describe('tools/call with flawed code', () => {
    it('executes verify_test_artifact with flawed Playwright code and returns failing structured result with actionable hints', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 5,
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

      const structured = data.result?.structuredContent as
        | {
            passed: boolean;
            score: number;
            checks: Array<{ id: string; rule: string; passed: boolean; severity: string }>;
            actionableHints: string[];
          }
        | undefined;

      expect(structured).toBeDefined();
      expect.soft(structured?.passed).toBe(false);
      expect.soft(structured?.score).toBeLessThan(100);
      expect.soft(structured?.actionableHints.length).toBeGreaterThanOrEqual(2);
      expect(structured?.actionableHints.some((h) => h.includes('[no-arbitrary-waits]'))).toBe(
        true
      );
      expect(structured?.actionableHints.some((h) => h.includes('[meaningful-assertions]'))).toBe(
        true
      );

      const content = data.result?.content;
      expect.soft(Array.isArray(content)).toBe(true);
      expect.soft(content?.[0]?.text).toContain('FAILED');
      expect.soft(content?.[0]?.text).toContain('Actionable Hints:');
      expect.soft(content?.[0]?.text).toContain('[no-arbitrary-waits]');
    });

    it('detects state isolation failure in Selenium and provides actionable hints', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 6,
        method: 'tools/call',
        params: {
          name: 'verify_test_artifact',
          arguments: {
            framework: 'selenium',
            language: 'java',
            code: `
              public class SharedDriverTest {
                public static WebDriver driver;

                @Test
                public void testMethod() {
                  driver.get("https://example.com");
                  Assert.assertEquals("Example", driver.getTitle());
                }
              }
            `,
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      const structured = data.result?.structuredContent as {
        passed: boolean;
        score: number;
        actionableHints: string[];
      };
      expect(structured.passed).toBe(false);
      expect(structured.actionableHints.some((h) => h.includes('[thread-isolated-state]'))).toBe(
        true
      );
    });
  });

  describe('tools/call error handling & input validation (SEP-1303)', () => {
    it('returns error when code is missing', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 10,
        method: 'tools/call',
        params: {
          name: 'verify_test_artifact',
          arguments: {
            framework: 'playwright',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);
    });

    it('returns error when framework is invalid or unsupported', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 11,
        method: 'tools/call',
        params: {
          name: 'verify_test_artifact',
          arguments: {
            framework: 'unsupported-framework',
            code: 'expect(true).toBe(true);',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);
    });

    it('returns error when code is an empty string', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 12,
        method: 'tools/call',
        params: {
          name: 'verify_test_artifact',
          arguments: {
            framework: 'playwright',
            code: '',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);
    });

    it('returns error when unrecognized hallucinated arguments are passed via strict schema', async () => {
      const res = await mcpFetch(url, {
        jsonrpc: '2.0',
        id: 13,
        method: 'tools/call',
        params: {
          name: 'verify_test_artifact',
          arguments: {
            framework: 'playwright',
            code: 'expect(true).toBe(true);',
            unrecognizedProp: 'malicious',
          },
        },
      });

      expect.soft(res.status).toBe(200);
      const data = await parseMcpResponse(res);
      expect(data.result?.isError).toBe(true);
    });
  });
});
