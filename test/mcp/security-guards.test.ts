import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  resolveSafePath,
  sanitizeDomain,
  sanitizeLanguage,
} from '../../servers/src/domains/shared.js';
import { readPlaywrightReferenceDoc } from '../../servers/src/domains/playwright/common.js';
import { readSeleniumReferenceDoc } from '../../servers/src/domains/selenium/common.js';
import { readCypressReferenceDoc } from '../../servers/src/domains/cypress/common.js';
import { readVibiumReferenceDoc } from '../../servers/src/domains/vibium/common.js';
import { readAppiumReferenceDoc } from '../../servers/src/domains/appium/common.js';

describe('Security Guards: Path Traversal & Sanitization', () => {
  describe('sanitizeLanguage', () => {
    const allowed = ['typescript', 'javascript', 'python', 'java', 'csharp'] as const;

    it('returns normalized language for valid supported languages', () => {
      expect(sanitizeLanguage('typescript', allowed)).toBe('typescript');
      expect(sanitizeLanguage('  Python  ', allowed)).toBe('python');
      expect(sanitizeLanguage('JAVA', allowed)).toBe('java');
    });

    it('resolves aliases to canonical language names', () => {
      expect(sanitizeLanguage('ts', allowed)).toBe('typescript');
      expect(sanitizeLanguage('js', allowed)).toBe('javascript');
      expect(sanitizeLanguage('py', allowed)).toBe('python');
      expect(sanitizeLanguage('cs', allowed)).toBe('csharp');
      expect(sanitizeLanguage('c#', allowed)).toBe('csharp');
    });

    it('falls back to default language when input is null, undefined, or empty', () => {
      expect(sanitizeLanguage(undefined, allowed, 'typescript')).toBe('typescript');
      expect(sanitizeLanguage(null, allowed, 'typescript')).toBe('typescript');
      expect(sanitizeLanguage('', allowed, 'typescript')).toBe('typescript');
      expect(sanitizeLanguage('   ', allowed, 'typescript')).toBe('typescript');
    });

    it('throws when language is empty and no default is provided', () => {
      expect(() => sanitizeLanguage('', allowed)).toThrow(/required/i);
      expect(() => sanitizeLanguage(undefined, allowed)).toThrow(/required/i);
    });

    it('rejects path traversal sequences (../, ..\\)', () => {
      expect(() => sanitizeLanguage('../../../etc/passwd', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
      expect(() => sanitizeLanguage('..\\..\\windows\\win.ini', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
      expect(() => sanitizeLanguage('typescript/../python', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
    });

    it('rejects path separators (slashes and backslashes)', () => {
      expect(() => sanitizeLanguage('sub/typescript', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
      expect(() => sanitizeLanguage('sub\\typescript', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
      expect(() => sanitizeLanguage('/typescript', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
    });

    it('rejects null byte injection', () => {
      expect(() => sanitizeLanguage('typescript\0.md', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
      expect(() => sanitizeLanguage('\0', allowed)).toThrow(/path traversal|illegal characters/i);
    });

    it('rejects unsupported languages not in allowed list', () => {
      expect(() => sanitizeLanguage('rust', allowed)).toThrow(/unsupported.*language/i);
      expect(() => sanitizeLanguage('golang', allowed, undefined, 'Playwright')).toThrow(
        /unsupported playwright language/i
      );
    });
  });

  describe('sanitizeDomain', () => {
    const allowed = ['actions', 'locators', 'network'] as const;

    it('returns normalized domain for valid supported domains', () => {
      expect(sanitizeDomain('actions', allowed)).toBe('actions');
      expect(sanitizeDomain('  LOCATORS  ', allowed)).toBe('locators');
    });

    it('falls back to default domain when input is null, undefined, or empty', () => {
      expect(sanitizeDomain(undefined, allowed, 'locators')).toBe('locators');
      expect(sanitizeDomain(null, allowed, 'locators')).toBe('locators');
      expect(sanitizeDomain('', allowed, 'locators')).toBe('locators');
    });

    it('throws when domain is empty and no default is provided', () => {
      expect(() => sanitizeDomain('', allowed)).toThrow(/required/i);
      expect(() => sanitizeDomain(undefined, allowed)).toThrow(/required/i);
    });

    it('rejects path traversal sequences (../, ..\\)', () => {
      expect(() => sanitizeDomain('../../../etc/passwd', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
      expect(() => sanitizeDomain('..\\..\\windows\\win.ini', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
    });

    it('rejects path separators (slashes and backslashes)', () => {
      expect(() => sanitizeDomain('sub/locators', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
      expect(() => sanitizeDomain('/locators', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
    });

    it('rejects null byte injection', () => {
      expect(() => sanitizeDomain('locators\0', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
    });

    it('rejects unsupported domains not in allowed list', () => {
      expect(() => sanitizeDomain('invalid_domain', allowed)).toThrow(/unsupported.*domain/i);
      expect(() => sanitizeDomain('invalid_domain', allowed, undefined, 'Playwright')).toThrow(
        /unsupported playwright domain/i
      );
    });
  });

  describe('resolveSafePath', () => {
    const baseDir = '/app/server/domains/playwright/references';

    it('resolves valid relative paths inside the base directory', () => {
      const resolved = resolveSafePath(baseDir, 'typescript.md');
      expect(resolved).toBe(path.resolve(baseDir, 'typescript.md'));
    });

    it('resolves valid nested relative paths inside the base directory', () => {
      const resolved = resolveSafePath(baseDir, 'sub/nested.md');
      expect(resolved).toBe(path.resolve(baseDir, 'sub/nested.md'));
    });

    it('resolves base directory when relativeTarget is empty or dot', () => {
      const resolved = resolveSafePath(baseDir, '.');
      expect(resolved).toBe(path.resolve(baseDir));
    });

    it('supports file:// URL format as baseDir', () => {
      const fileUrlBase = 'file:///app/server/domains/playwright/references';
      const resolved = resolveSafePath(fileUrlBase, 'typescript.md');
      expect(resolved).toBe(
        fileURLToPath('file:///app/server/domains/playwright/references/typescript.md')
      );
    });

    it('rejects path traversal attempting to escape base directory with ../', () => {
      expect(() => resolveSafePath(baseDir, '../other.md')).toThrow(/path traversal detected/i);
      expect(() => resolveSafePath(baseDir, '../../etc/passwd')).toThrow(
        /path traversal detected/i
      );
      expect(() => resolveSafePath(baseDir, 'sub/../../outside.md')).toThrow(
        /path traversal detected/i
      );
    });

    it('rejects absolute paths pointing outside base directory', () => {
      expect(() => resolveSafePath(baseDir, '/etc/passwd')).toThrow(/path traversal detected/i);
    });

    it('rejects null byte in baseDir or relativeTarget', () => {
      expect(() => resolveSafePath(`${baseDir}\0`, 'typescript.md')).toThrow(/null byte/i);
      expect(() => resolveSafePath(baseDir, 'typescript.md\0')).toThrow(/null byte/i);
    });
  });

  describe('Domain Reference Loaders Hardening', () => {
    describe('Playwright', () => {
      it('successfully loads reference markdown for valid language', async () => {
        const text = await readPlaywrightReferenceDoc('locators', 'typescript');
        expect(text).toContain('Playwright');
      });

      it('rejects path traversal in domain', async () => {
        await expect(
          readPlaywrightReferenceDoc('../../../etc/passwd', 'typescript')
        ).rejects.toThrow();
      });

      it('rejects path traversal in language', async () => {
        await expect(readPlaywrightReferenceDoc('locators', '../../etc/passwd')).rejects.toThrow();
      });
    });

    describe('Selenium', () => {
      it('successfully loads reference markdown for valid language', async () => {
        const text = await readSeleniumReferenceDoc('actions', 'java');
        expect(text).toContain('Selenium');
      });

      it('rejects path traversal in domain', async () => {
        await expect(readSeleniumReferenceDoc('../../../etc/passwd', 'java')).rejects.toThrow();
      });

      it('rejects path traversal in language', async () => {
        await expect(readSeleniumReferenceDoc('actions', '../../etc/passwd')).rejects.toThrow();
      });
    });

    describe('Cypress', () => {
      it('successfully loads reference markdown for valid language', async () => {
        const text = await readCypressReferenceDoc('commands', 'typescript');
        expect(text).toContain('Cypress');
      });

      it('rejects path traversal in domain', async () => {
        await expect(
          readCypressReferenceDoc('../../../etc/passwd', 'typescript')
        ).rejects.toThrow();
      });

      it('rejects path traversal in language', async () => {
        await expect(readCypressReferenceDoc('commands', '../../etc/passwd')).rejects.toThrow();
      });
    });

    describe('Vibium', () => {
      it('successfully loads reference markdown for valid language', async () => {
        const text = await readVibiumReferenceDoc('core', 'typescript');
        expect(text).toContain('Vibium');
      });

      it('rejects path traversal in domain', async () => {
        await expect(readVibiumReferenceDoc('../../../etc/passwd', 'typescript')).rejects.toThrow();
      });

      it('rejects path traversal in language', async () => {
        await expect(readVibiumReferenceDoc('core', '../../etc/passwd')).rejects.toThrow();
      });
    });

    describe('Appium', () => {
      it('successfully loads reference markdown for valid language', async () => {
        const text = await readAppiumReferenceDoc('capabilities', 'typescript');
        expect(text).toContain('Appium');
      });

      it('rejects path traversal in domain', async () => {
        await expect(readAppiumReferenceDoc('../../../etc/passwd', 'typescript')).rejects.toThrow();
      });

      it('rejects path traversal in language', async () => {
        await expect(readAppiumReferenceDoc('capabilities', '../../etc/passwd')).rejects.toThrow();
      });
    });
  });
});
