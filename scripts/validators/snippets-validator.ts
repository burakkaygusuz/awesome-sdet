import fs from 'node:fs/promises';
import path from 'node:path';
import { Language, Parser } from 'web-tree-sitter';

import {
  ensureParserInitialized,
  loadGrammarLanguage,
  resolveGrammar,
  type SupportedGrammar,
  WASM_FILE_BY_GRAMMAR,
} from '../../servers/src/verification/ast.js';

export type { SupportedGrammar };

export interface ExtractedSnippet {
  readonly relPath: string;
  readonly filePath: string;
  readonly rawLang: string;
  readonly grammar: SupportedGrammar | null;
  readonly code: string;
  readonly startLine: number;
}

export type LanguageGrammarMap = Readonly<Record<SupportedGrammar, Language>>;

export { resolveGrammar };

let cachedEnginePromise: Promise<{
  parser: Parser;
  languages: LanguageGrammarMap;
}> | null = null;

export async function loadTreeSitterEngine(): Promise<{
  parser: Parser;
  languages: LanguageGrammarMap;
}> {
  cachedEnginePromise ??= (async () => {
    await ensureParserInitialized();
    const parser = new Parser();

    const grammars = Object.keys(WASM_FILE_BY_GRAMMAR) as SupportedGrammar[];
    const entries = await Promise.all(
      grammars.map(async (grammar) => {
        const lang = await loadGrammarLanguage(grammar);
        return [grammar, lang] as const;
      })
    );

    const languages = Object.fromEntries(entries) as unknown as LanguageGrammarMap;
    return { parser, languages };
  })();

  return cachedEnginePromise;
}

export async function collectReferenceMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const parentDir = entry.parentPath ?? dir;
      files.push(path.join(parentDir, entry.name));
    }
  }

  return files;
}

export function extractSnippetsFromMarkdown(
  content: string,
  relPath: string,
  filePath = ''
): ExtractedSnippet[] {
  const lines = content.split('\n');
  const snippets: ExtractedSnippet[] = [];

  let inBlock = false;
  let currentLang = '';
  let currentLines: string[] = [];
  let blockStartLine = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      if (inBlock) {
        inBlock = false;
        const code = currentLines.join('\n').trim();
        if (code.length > 0) {
          snippets.push({
            relPath,
            filePath,
            rawLang: currentLang,
            grammar: resolveGrammar(currentLang),
            code,
            startLine: blockStartLine,
          });
        }
      } else {
        inBlock = true;
        currentLang = trimmed.slice(3).trim().toLowerCase();
        currentLines = [];
        blockStartLine = i + 1;
      }
    } else if (inBlock) {
      currentLines.push(line);
    }
  }

  return snippets;
}

export function validateSingleSnippet(
  parser: Parser,
  languages: LanguageGrammarMap,
  snippet: ExtractedSnippet
): boolean {
  if (!snippet.grammar) {
    return true;
  }

  const grammar = languages[snippet.grammar];
  parser.setLanguage(grammar);

  const tree = parser.parse(snippet.code);
  if (!tree) {
    console.error(
      `Error: ${snippet.relPath}:${snippet.startLine}: Failed to allocate tree for ${snippet.rawLang} block`
    );
    return false;
  }

  try {
    if (tree.rootNode.hasError) {
      const errorNodes = tree.rootNode.descendantsOfType('ERROR');
      console.error(
        `Error: ${snippet.relPath}:${snippet.startLine}: Syntax error in ${snippet.rawLang} code block (${errorNodes.length} error node(s))`
      );
      return false;
    }
    return true;
  } finally {
    tree.delete();
  }
}

export async function validateSnippets(rootDir: string): Promise<boolean> {
  const domainsDir = path.join(rootDir, 'servers/src/domains');

  try {
    await fs.access(domainsDir);
  } catch {
    console.error('Error: servers/src/domains directory not found');
    return false;
  }

  const [{ parser, languages }, mdFiles] = await Promise.all([
    loadTreeSitterEngine(),
    collectReferenceMarkdownFiles(domainsDir),
  ]);

  const fileSnippets = await Promise.all(
    mdFiles.map(async (file) => {
      const content = await fs.readFile(file, 'utf8');
      const relPath = path.relative(rootDir, file);
      return extractSnippetsFromMarkdown(content, relPath, file);
    })
  );

  let allValid = true;

  for (const snippets of fileSnippets) {
    for (const snippet of snippets) {
      const isValid = validateSingleSnippet(parser, languages, snippet);
      if (!isValid) {
        allValid = false;
      }
    }
  }

  return allValid;
}
