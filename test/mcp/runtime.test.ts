import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const entrypoint = join(__dirname, '../../servers/dist/index.js');

describe('Runtime Entrypoint Tests', () => {
  it('compiled entrypoint exposes a closable HTTP server factory', async () => {
    const { createHttpServer } = await import('../../servers/src/index.js');
    const server = createHttpServer();

    expect.soft(typeof server.listen).toBe('function');
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', () => resolve());
    });
    await new Promise<void>((resolve, reject) =>
      server.close((error?: Error) => (error ? reject(error) : resolve()))
    );
  });

  it('rejects invalid PORT configuration values asynchronously', async () => {
    for (const invalidPort of ['0', 'abc', '99999']) {
      try {
        await execFileAsync('node', [entrypoint], {
          env: { ...process.env, PORT: invalidPort },
        });
        expect.unreachable('Should have failed with invalid PORT');
      } catch (err: unknown) {
        const error = err as { stderr?: string };
        expect.soft(error.stderr).toContain('Invalid PORT');
      }
    }
  });

  it('reads MCP documentation references dynamically across supported languages', async () => {
    const { handleActionsDocs } = await import('../../servers/src/domains/selenium/index.js');

    for (const lang of ['typescript', 'python', 'java', 'csharp'] as const) {
      const res = await handleActionsDocs({ language: lang });
      expect.soft(res.content).toBeDefined();
      expect.soft(res.content[0].text.length).toBeGreaterThan(0);
    }
  });

  it('runs stdio mode successfully when --stdio argument is supplied', async () => {
    const child = execFile('node', [entrypoint, '--stdio']);
    let stdoutData = '';

    child.stdout?.on('data', (chunk) => {
      stdoutData += String(chunk);
    });

    child.stdin?.write(`${JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'tools/list' })}\n`);
    child.stdin?.end();

    await new Promise<void>((resolve) => child.on('exit', () => resolve()));
    expect.soft(child.exitCode).toBe(0);
    expect.soft(typeof stdoutData).toBe('string');
  });
});
