import { execFile } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';
import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);
const __dirname = dirname(fileURLToPath(import.meta.url));
const entrypoint = join(__dirname, '../dist/index.js');

describe('Runtime Entrypoint Tests', () => {
  it('compiled entrypoint exposes a closable HTTP server factory', async () => {
    const { createHttpServer } = await import('../dist/index.js');
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

  it('reads MCP documentation references correctly across modules', async () => {
    const { handleBidiDocs, handleActionsDocs, handleListenersDocs, handlePageFactoryDocs } =
      await import('../src/selenium/index.js');

    const bidiRes = await handleBidiDocs({ language: 'python' });
    expect.soft(bidiRes.content[0].text).toContain('Python API Reference');

    const actionsRes = await handleActionsDocs({ language: 'csharp' });
    expect.soft(actionsRes.content[0].text).toContain('C# API Reference');

    const listenersRes = await handleListenersDocs({ language: 'python' });
    expect.soft(listenersRes.content[0].text).toContain('Python API Reference');

    const pageFactoryRes = await handlePageFactoryDocs({ language: 'typescript' });
    expect.soft(pageFactoryRes.content[0].text).toContain('TypeScript API Reference');
  });

  it('read_se_grid_docs returns Grid documentation for java', async () => {
    const { handleGridDocs } = await import('../src/selenium/index.js');
    const result = await handleGridDocs({ language: 'java' });
    expect.soft(result.content[0].text).toContain('RemoteWebDriver');
  });

  it('read_se_observability_docs returns Observability documentation for java', async () => {
    const { handleObservabilityDocs } = await import('../src/selenium/index.js');
    const result = await handleObservabilityDocs({ language: 'java' });
    expect.soft(result.content[0].text).toContain('Observability');
  });
});
