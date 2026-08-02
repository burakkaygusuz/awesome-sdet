import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const __dirname = dirname(fileURLToPath(import.meta.url));
const entrypoint = join(__dirname, '../dist/index.js');

describe('Runtime Entrypoint Tests', () => {
  it('compiled entrypoint exposes a closable HTTP server factory', async () => {
    const { createHttpServer } = await import('../dist/index.js');
    const server = createHttpServer();

    expect(typeof server.listen).toBe('function');
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => resolve());
    });
    await new Promise<void>((resolve, reject) =>
      server.close((error?: Error) => (error ? reject(error) : resolve()))
    );
  });

  it('invalid PORT=0 rejects with a clear error', () => {
    const result = spawnSync('node', [entrypoint], {
      env: { ...process.env, PORT: '0' },
      encoding: 'utf8',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Invalid PORT');
  });

  it('invalid PORT=abc rejects with a clear error', () => {
    const result = spawnSync('node', [entrypoint], {
      env: { ...process.env, PORT: 'abc' },
      encoding: 'utf8',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Invalid PORT');
  });

  it('invalid PORT=99999 rejects with a clear error', () => {
    const result = spawnSync('node', [entrypoint], {
      env: { ...process.env, PORT: '99999' },
      encoding: 'utf8',
    });
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Invalid PORT');
  });

  it('undefined PORT falls back to 3000 silently', async () => {
    const { createHttpServer } = await import('../dist/index.js');
    const server = createHttpServer();
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => resolve());
    });
    await new Promise<void>((resolve, reject) =>
      server.close((error?: Error) => (error ? reject(error) : resolve()))
    );
  });
});
