import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  readFrameworkReferenceDoc,
  resolveSafePath,
  sanitizeDomain,
  sanitizeLanguage,
} from '../../servers/src/domains/shared.js';

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

    it('rejects path traversal sequences with forward and backward slashes', () => {
      expect(() => sanitizeLanguage('../../../etc/passwd', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
      expect(() => sanitizeLanguage(String.raw`..\..\windows\win.ini`, allowed)).toThrow(
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
      expect(() => sanitizeLanguage(String.raw`sub\typescript`, allowed)).toThrow(
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

    it('rejects path traversal sequences with forward and backward slashes', () => {
      expect(() => sanitizeDomain('../../../etc/passwd', allowed)).toThrow(
        /path traversal|illegal characters/i
      );
      expect(() => sanitizeDomain(String.raw`..\..\windows\win.ini`, allowed)).toThrow(
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
    const frameworks = [
      { framework: 'playwright', domain: 'locators', lang: 'typescript', name: 'Playwright' },
      { framework: 'selenium', domain: 'actions', lang: 'java', name: 'Selenium' },
      { framework: 'cypress', domain: 'commands', lang: 'typescript', name: 'Cypress' },
      { framework: 'vibium', domain: 'core', lang: 'typescript', name: 'Vibium' },
      { framework: 'appium', domain: 'capabilities', lang: 'typescript', name: 'Appium' },
    ] as const;

    it.each(frameworks)(
      'loads valid markdown and rejects path traversal for $name',
      async ({ framework, domain, lang, name }) => {
        const text = await readFrameworkReferenceDoc(framework, domain, lang);
        expect(text).toContain(name);

        await expect(
          readFrameworkReferenceDoc(framework, '../../../etc/passwd', lang)
        ).rejects.toThrow();

        await expect(
          readFrameworkReferenceDoc(framework, domain, '../../etc/passwd')
        ).rejects.toThrow();
      }
    );
  });
});
