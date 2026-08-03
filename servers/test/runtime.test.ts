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

  it('rejects invalid PORT configuration values', () => {
    for (const invalidPort of ['0', 'abc', '99999']) {
      const result = spawnSync('node', [entrypoint], {
        env: { ...process.env, PORT: invalidPort },
        encoding: 'utf8',
      });
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('Invalid PORT');
    }
  });

  it('reads MCP documentation references correctly across modules', async () => {
    const { handleBidiDocs, handleActionsDocs, handleListenersDocs, handlePageFactoryDocs } =
      await import('../src/selenium/index.js');

    const bidiRes = await handleBidiDocs({ language: 'python' });
    expect(bidiRes.content[0].text).toContain('Python API Reference');

    const actionsRes = await handleActionsDocs({ language: 'csharp' });
    expect(actionsRes.content[0].text).toContain('C# API Reference');

    const listenersRes = await handleListenersDocs({ language: 'python' });
    expect(listenersRes.content[0].text).toContain('Python API Reference');

    const pageFactoryRes = await handlePageFactoryDocs({ language: 'typescript' });
    expect(pageFactoryRes.content[0].text).toContain('TypeScript API Reference');
  });
});
