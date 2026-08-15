import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadCachedReferenceMarkdown } from '../../servers/src/domains/shared.js';
import {
  PLAYWRIGHT_DOMAINS,
  PLAYWRIGHT_SUPPORTED_LANGUAGES,
  readPlaywrightReferenceDoc,
} from '../../servers/src/domains/playwright/common.js';
import { safeToolHandler } from '../../servers/src/server.js';

describe('reference language and tool error contracts', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('advertises Playwright JavaScript only when every domain has a reference', async () => {
    expect(PLAYWRIGHT_SUPPORTED_LANGUAGES).toContain('javascript');

    for (const domain of PLAYWRIGHT_DOMAINS) {
      await expect(readPlaywrightReferenceDoc(domain, 'javascript')).resolves.toContain(
        'Playwright'
      );
    }
  });

  it('does not replace a missing language reference with another language', async () => {
    const rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'awesome-sdet-reference-'));
    const referencesDir = path.join(rootDir, 'references');
    fs.mkdirSync(referencesDir);
    fs.writeFileSync(path.join(referencesDir, 'typescript.md'), 'TypeScript reference', 'utf8');

    try {
      await expect(loadCachedReferenceMarkdown(rootDir, 'javascript')).rejects.toThrow();
    } finally {
      fs.rmSync(rootDir, { recursive: true, force: true });
    }
  });

  it('returns a generic error and writes structured diagnostic data', async () => {
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const result = await safeToolHandler<undefined>(() => {
      throw new Error('sensitive backend details');
    })(undefined);
    const publicText = result.content?.[0]?.text ?? '';

    expect(result.isError).toBe(true);
    expect(publicText.toLowerCase()).toContain('reference');
    expect(publicText).not.toContain('sensitive backend details');
    expect(errorLog).toHaveBeenCalledWith(
      expect.stringContaining('"event":"tool_execution_error"')
    );
    expect(errorLog).toHaveBeenCalledWith(expect.stringContaining('sensitive backend details'));
  });
});
