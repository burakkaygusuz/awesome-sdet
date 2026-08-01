import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';

const __dirname = dirname(fileURLToPath(import.meta.url));
const entrypoint = join(__dirname, '../dist/index.js');

test('compiled entrypoint exposes a closable HTTP server factory', async () => {
  const { createHttpServer } = await import('../dist/index.js');
  const server = createHttpServer();

  assert.equal(typeof server.listen, 'function');
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});

test('invalid PORT=0 rejects with a clear error', () => {
  const result = spawnSync('node', [entrypoint], {
    env: { ...process.env, PORT: '0' },
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0, 'process must exit non-zero for PORT=0');
  assert.ok(
    result.stderr.includes('Invalid PORT'),
    `Expected "Invalid PORT" in stderr, got: ${result.stderr}`
  );
});

test('invalid PORT=abc rejects with a clear error', () => {
  const result = spawnSync('node', [entrypoint], {
    env: { ...process.env, PORT: 'abc' },
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0, 'process must exit non-zero for PORT=abc');
  assert.ok(
    result.stderr.includes('Invalid PORT'),
    `Expected "Invalid PORT" in stderr, got: ${result.stderr}`
  );
});

test('invalid PORT=99999 rejects with a clear error', () => {
  const result = spawnSync('node', [entrypoint], {
    env: { ...process.env, PORT: '99999' },
    encoding: 'utf8',
  });
  assert.notEqual(result.status, 0, 'process must exit non-zero for PORT=99999');
  assert.ok(
    result.stderr.includes('Invalid PORT'),
    `Expected "Invalid PORT" in stderr, got: ${result.stderr}`
  );
});

test('undefined PORT falls back to 3000 silently', async () => {
  const { createHttpServer } = await import('../dist/index.js');
  const server = createHttpServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  await new Promise((resolve, reject) =>
    server.close((error) => (error ? reject(error) : resolve()))
  );
});
