import assert from 'node:assert/strict';
import http from 'node:http';
import test from 'node:test';
import { LATEST_PROTOCOL_VERSION } from '@modelcontextprotocol/sdk/types.js';
import { createHttpServer } from '../dist/index.js';

const MCP_HEADERS = {
  'Content-Type': 'application/json',
  Accept: 'application/json, text/event-stream',
};

async function parseMcpResponse(res) {
  const rawText = await res.text();
  if (rawText.includes('data: ')) {
    const jsonStr = rawText.substring(rawText.indexOf('{'));
    return JSON.parse(jsonStr);
  }
  return JSON.parse(rawText);
}

test('MCP HTTP transport protocol tests', async (t) => {
  const server = createHttpServer();

  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Server address is not an object');
  }

  const url = `http://127.0.0.1:${address.port}/mcp`;

  t.after(async () => {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  });

  await t.test('initialize', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'initialize',
        params: {
          protocolVersion: LATEST_PROTOCOL_VERSION,
          capabilities: {},
          clientInfo: { name: 'test-client', version: '1.0.0' },
        },
      }),
    });

    assert.equal(res.status, 200);
    const data = await parseMcpResponse(res);
    assert.equal(data.jsonrpc, '2.0');
    assert.equal(data.id, 1);
    assert.ok(data.result);
    assert.equal(data.result.protocolVersion, LATEST_PROTOCOL_VERSION);
  });

  await t.test('tools/list', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({ jsonrpc: '2.0', id: 2, method: 'tools/list' }),
    });

    assert.equal(res.status, 200);
    const data = await parseMcpResponse(res);
    assert.equal(data.jsonrpc, '2.0');
    assert.equal(data.id, 2);
    assert.ok(data.result);
    const toolNames = new Set(data.result.tools.map((t) => t.name));
    assert.ok(toolNames.has('execute_se_explicit_wait'));
    assert.ok(toolNames.has('execute_se_cdp_intercept'));
    assert.ok(toolNames.has('read_pagefactory_docs'));
  });

  await t.test('tools/call - read_pagefactory_docs', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 30,
        method: 'tools/call',
        params: {
          name: 'read_pagefactory_docs',
          arguments: {
            className: 'AjaxElementLocator',
          },
        },
      }),
    });

    assert.equal(res.status, 200);
    const data = await parseMcpResponse(res);
    assert.equal(data.jsonrpc, '2.0');
    assert.equal(data.id, 30);
    assert.ok(data.result);
    assert.ok(Array.isArray(data.result.content));
    const text = data.result.content[0]?.text || '';
    assert.ok(text.includes('AjaxElementLocator'));
  });

  await t.test('tools/call - valid call', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 3,
        method: 'tools/call',
        params: {
          name: 'execute_se_explicit_wait',
          arguments: {
            targetUrl: 'https://example.com',
            condition: 'elementToBeClickable',
            locator: { by: 'id', value: 'button' },
          },
        },
      }),
    });

    assert.equal(res.status, 200);
    const data = await parseMcpResponse(res);
    assert.equal(data.jsonrpc, '2.0');
    assert.equal(data.id, 3);
    assert.ok(data.result);
    assert.ok(Array.isArray(data.result.content));
    const responseText = data.result.content[0]?.text || '';
    assert.ok(responseText.includes('no browser was driven'));
  });

  await t.test('tools/call - invalid call', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 4,
        method: 'tools/call',
        params: {
          name: 'execute_se_explicit_wait',
          arguments: {
            targetUrl: 12345,
            condition: 'elementToBeClickable',
            locator: { by: 'id', value: 'button' },
          },
        },
      }),
    });

    assert.equal(res.status, 200);
    const data = await parseMcpResponse(res);
    assert.equal(data.jsonrpc, '2.0');
    assert.equal(data.id, 4);
    assert.ok(data.result);
    assert.equal(data.result.isError, true);
  });

  await t.test('host/origin guard - rejects non-local Host', async () => {
    const statusCode = await new Promise((resolve, reject) => {
      const req = http.request(
        url,
        {
          method: 'POST',
          headers: { ...MCP_HEADERS, Host: 'example.test' },
        },
        (res) => resolve(res.statusCode || 0)
      );
      req.on('error', reject);
      req.end(JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/list' }));
    });
    assert.equal(statusCode, 403);
  });

  await t.test('host/origin guard - rejects non-local Origin', async () => {
    const statusCode = await new Promise((resolve, reject) => {
      const req = http.request(
        url,
        {
          method: 'POST',
          headers: { ...MCP_HEADERS, Origin: 'http://evil.com' },
        },
        (res) => resolve(res.statusCode || 0)
      );
      req.on('error', reject);
      req.end(JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/list' }));
    });
    assert.equal(statusCode, 403);
  });

  await t.test('cors preflight - handles OPTIONS /mcp for local origin', async () => {
    const res = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        Host: '127.0.0.1',
        Origin: 'http://localhost:5173',
        'Access-Control-Request-Method': 'POST',
      },
    });

    assert.equal(res.status, 204);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:5173');
    assert.ok(res.headers.get('access-control-allow-methods')?.includes('POST'));
  });

  await t.test('cors headers - includes Access-Control-Allow-Origin on POST', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        ...MCP_HEADERS,
        Origin: 'http://localhost:3000',
      },
      body: JSON.stringify({ jsonrpc: '2.0', id: 99, method: 'tools/list' }),
    });

    assert.equal(res.status, 200);
    assert.equal(res.headers.get('access-control-allow-origin'), 'http://localhost:3000');
  });

  await t.test('tools/call - credentials not reflected', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 5,
        method: 'tools/call',
        params: {
          name: 'execute_se_cdp_intercept',
          arguments: {
            targetUrl: 'https://example.com',
            urlPattern: '*://api.example.com/*',
            action: 'injectBasicAuth',
            authCredentials: {
              username: 'secret_user_name',
              password: 'secret_password_123',
            },
          },
        },
      }),
    });

    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(!text.includes('secret_user_name'));
    assert.ok(!text.includes('secret_password_123'));
  });

  await t.test('tools/call - response does not echo input parameters', async () => {
    const SENTINEL_URL = 'https://unique-sentinel-target-url.example.com/path';
    const SENTINEL_VALUE = 'unique-sentinel-locator-value-9f3a';
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 10,
        method: 'tools/call',
        params: {
          name: 'execute_se_explicit_wait',
          arguments: {
            targetUrl: SENTINEL_URL,
            condition: 'elementToBeClickable',
            locator: { by: 'id', value: SENTINEL_VALUE },
          },
        },
      }),
    });
    assert.equal(res.status, 200);
    const text = await res.text();
    assert.ok(!text.includes(SENTINEL_URL), 'response must not echo targetUrl back');
    assert.ok(!text.includes(SENTINEL_VALUE), 'response must not echo locator value back');
  });

  await t.test('tools/call - rejects targetUrl exceeding 2048 chars', async () => {
    const longUrl = 'https://example.com/' + 'a'.repeat(2048);
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 11,
        method: 'tools/call',
        params: {
          name: 'execute_se_explicit_wait',
          arguments: {
            targetUrl: longUrl,
            condition: 'elementToBeClickable',
            locator: { by: 'id', value: 'btn' },
          },
        },
      }),
    });
    assert.equal(res.status, 200);
    const data = await parseMcpResponse(res);
    assert.equal(data.result.isError, true);
  });

  await t.test('tools/call - rejects locator.value exceeding 512 chars', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 12,
        method: 'tools/call',
        params: {
          name: 'execute_se_explicit_wait',
          arguments: {
            targetUrl: 'https://example.com',
            condition: 'elementToBeClickable',
            locator: { by: 'id', value: 'x'.repeat(513) },
          },
        },
      }),
    });
    assert.equal(res.status, 200);
    const data = await parseMcpResponse(res);
    assert.equal(data.result.isError, true);
  });

  await t.test('tools/call - rejects urlPattern exceeding 1024 chars', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 13,
        method: 'tools/call',
        params: {
          name: 'execute_se_cdp_intercept',
          arguments: {
            targetUrl: 'https://example.com',
            urlPattern: '*/' + 'p'.repeat(1024),
            action: 'blockRequest',
          },
        },
      }),
    });
    assert.equal(res.status, 200);
    const data = await parseMcpResponse(res);
    assert.equal(data.result.isError, true);
  });

  await t.test('tools/call - rejects mockResponseBody exceeding 4096 chars', async () => {
    const res = await fetch(url, {
      method: 'POST',
      headers: MCP_HEADERS,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 14,
        method: 'tools/call',
        params: {
          name: 'execute_se_cdp_intercept',
          arguments: {
            targetUrl: 'https://example.com',
            urlPattern: '*/api/*',
            action: 'mockResponse',
            mockResponseBody: 'b'.repeat(4097),
          },
        },
      }),
    });
    assert.equal(res.status, 200);
    const data = await parseMcpResponse(res);
    assert.equal(data.result.isError, true);
  });
});
