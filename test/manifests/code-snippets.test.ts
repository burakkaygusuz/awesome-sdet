import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import ts from 'typescript';
import { beforeAll, describe, expect, it } from 'vitest';
import type { Parser } from 'web-tree-sitter';

import {
  collectReferenceMarkdownFiles,
  extractSnippetsFromMarkdown,
  loadTreeSitterEngine,
  type ExtractedSnippet,
  type LanguageGrammarMap,
} from '../../scripts/validators/snippets-validator.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../');

describe('polyglot code snippet AST validation (Tree-sitter & TypeScript)', () => {
  let parser: Parser;
  let languages: LanguageGrammarMap;
  let allSnippets: ExtractedSnippet[] = [];
  let refFiles: string[] = [];

  beforeAll(async () => {
    const domainsDir = path.join(rootDir, 'servers/src/domains');

    const [engine, files] = await Promise.all([
      loadTreeSitterEngine(),
      collectReferenceMarkdownFiles(domainsDir),
    ]);

    parser = engine.parser;
    languages = engine.languages;
    refFiles = files;

    for (const file of refFiles) {
      const content = await fs.readFile(file, 'utf8');
      const relPath = path.relative(rootDir, file);
      const snippets = extractSnippetsFromMarkdown(content, relPath, file);
      allSnippets = allSnippets.concat(snippets);
    }
  });

  it('scans all reference files and discovers valid polyglot code blocks', () => {
    expect(refFiles.length).toBeGreaterThanOrEqual(130);
    expect(allSnippets.length).toBeGreaterThanOrEqual(250);
  });

  it('validates that code fence language tags match file context and framework registry', () => {
    const validTags = new Set([
      'typescript',
      'ts',
      'javascript',
      'js',
      'python',
      'py',
      'java',
      'csharp',
      'cs',
      'c#',
      'ruby',
      'rb',
      'bash',
      'sh',
      'shell',
      'graphql',
      'json',
      'yaml',
    ]);

    const tagErrors: string[] = [];

    for (const snippet of allSnippets) {
      if (!snippet.rawLang || !validTags.has(snippet.rawLang)) {
        tagErrors.push(
          `${snippet.relPath}:${snippet.startLine}: Unknown or missing language tag '${snippet.rawLang}'`
        );
      }

      const baseName = path.basename(snippet.filePath, '.md').toLowerCase();
      const auxiliaryTags = new Set(['bash', 'sh', 'shell', 'graphql', 'json', 'yaml']);

      if (
        ['python', 'java', 'ruby', 'csharp', 'typescript', 'javascript'].includes(baseName) &&
        !auxiliaryTags.has(snippet.rawLang)
      ) {
        const langFamily: Record<string, string[]> = {
          python: ['python', 'py'],
          java: ['java'],
          ruby: ['ruby', 'rb'],
          csharp: ['csharp', 'cs', 'c#'],
          typescript: ['typescript', 'ts'],
          javascript: ['javascript', 'js'],
        };
        const allowed = langFamily[baseName] ?? [baseName];
        if (!allowed.includes(snippet.rawLang)) {
          tagErrors.push(
            `${snippet.relPath}:${snippet.startLine}: Language tag '${snippet.rawLang}' does not match file target '${baseName}.md'`
          );
        }
      }
    }

    expect(tagErrors).toEqual([]);
  });

  it('verifies all polyglot code snippets (TS, JS, Python, Java, C#, Ruby) parse with 0 AST errors using Tree-sitter', () => {
    const syntaxErrors: Array<{
      file: string;
      line: number;
      lang: string;
      errorCount: number;
      sample: string[];
    }> = [];

    for (const snippet of allSnippets) {
      if (!snippet.grammar) continue;

      const grammar = languages[snippet.grammar];
      parser.setLanguage(grammar);

      const tree = parser.parse(snippet.code);
      if (!tree) {
        syntaxErrors.push({
          file: snippet.relPath,
          line: snippet.startLine,
          lang: snippet.rawLang,
          errorCount: 1,
          sample: ['Failed to allocate syntax tree'],
        });
        continue;
      }

      try {
        if (tree.rootNode.hasError) {
          const errorNodes = tree.rootNode.descendantsOfType('ERROR');
          syntaxErrors.push({
            file: snippet.relPath,
            line: snippet.startLine,
            lang: snippet.rawLang,
            errorCount: errorNodes.length,
            sample: errorNodes.map((n) => n.text.slice(0, 60)),
          });
        }
      } finally {
        tree.delete();
      }
    }

    expect(syntaxErrors).toEqual([]);
  });

  it('runs dual-layer TypeScript compiler syntax diagnostics on TS and JS snippets', () => {
    const tsErrors: Array<{ file: string; line: number; errors: string[] }> = [];

    for (const snippet of allSnippets) {
      const isTsOrJs = ['typescript', 'ts', 'javascript', 'js'].includes(snippet.rawLang);
      if (!isTsOrJs) continue;

      const sourceFile = ts.createSourceFile(
        'snippet.tsx',
        snippet.code,
        ts.ScriptTarget.Latest,
        true,
        ts.ScriptKind.TSX
      ) as ts.SourceFile & { parseDiagnostics?: ts.DiagnosticWithLocation[] };

      if (sourceFile.parseDiagnostics && sourceFile.parseDiagnostics.length > 0) {
        tsErrors.push({
          file: snippet.relPath,
          line: snippet.startLine,
          errors: sourceFile.parseDiagnostics.map((d: ts.DiagnosticWithLocation) =>
            typeof d.messageText === 'string' ? d.messageText : d.messageText.messageText
          ),
        });
      }
    }

    expect(tsErrors).toEqual([]);
  });
});
