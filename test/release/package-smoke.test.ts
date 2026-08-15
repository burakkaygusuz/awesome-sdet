import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { stageReleasePackage, verifyReleasePackage } from '../../scripts/release.js';

describe('release package', () => {
  it('contains and starts the executable MCP entrypoint', async () => {
    const stagingRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'awesome-sdet-package-'));
    let child: ReturnType<typeof execFile> | undefined;

    try {
      const packageDir = stageReleasePackage(process.cwd(), stagingRoot);

      verifyReleasePackage(packageDir);

      fs.symlinkSync(
        path.join(process.cwd(), 'servers/node_modules'),
        path.join(packageDir, 'node_modules')
      );

      let stderr = '';
      child = execFile('node', [path.join(packageDir, 'servers/dist/index.js'), '--stdio'], {
        cwd: packageDir,
      });
      child.stderr?.setEncoding('utf8');
      child.stderr?.on('data', (chunk: string) => {
        stderr += chunk;
      });

      const exitCode = await new Promise<number>((resolve, reject) => {
        child?.once('error', reject);
        child?.once('exit', (code) => resolve(code ?? -1));
        child?.stdin?.end(
          `${JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'tools/list',
            params: { _meta: { protocolVersion: '2025-06-18', clientCapabilities: {} } },
          })}\n`
        );
      });

      expect(fs.existsSync(path.join(packageDir, 'servers/dist/index.js'))).toBe(true);
      expect(exitCode, stderr).toBe(0);
    } finally {
      if (child?.exitCode === null) {
        child.kill();
      }
      fs.rmSync(stagingRoot, { recursive: true, force: true });
    }
  });
});
