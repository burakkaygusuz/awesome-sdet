import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';

import { Language, Parser } from 'web-tree-sitter';

const require = createRequire(import.meta.url);

export type SupportedGrammar =
  'tsx' | 'typescript' | 'javascript' | 'python' | 'java' | 'csharp' | 'ruby';

export interface ExtractedSnippet {
  readonly relPath: string;
  readonly filePath: string;
  readonly rawLang: string;
  readonly grammar: SupportedGrammar | null;
  readonly code: string;
  readonly startLine: number;
}

export type LanguageGrammarMap = Readonly<Record<SupportedGrammar, Language>>;

export const GRAMMAR_ALIASES: Readonly<Record<string, SupportedGrammar>> = Object.freeze({
  typescript: 'tsx',
  ts: 'tsx',
  tsx: 'tsx',
  javascript: 'javascript',
  js: 'javascript',
  jsx: 'javascript',
  python: 'python',
  py: 'python',
  java: 'java',
  csharp: 'csharp',
  cs: 'csharp',
  'c#': 'csharp',
  ruby: 'ruby',
  rb: 'ruby',
});

const WASM_FILE_BY_GRAMMAR: Readonly<Record<SupportedGrammar, string>> = Object.freeze({
  tsx: 'tree-sitter-tsx.wasm',
  typescript: 'tree-sitter-typescript.wasm',
  javascript: 'tree-sitter-javascript.wasm',
  python: 'tree-sitter-python.wasm',
  java: 'tree-sitter-java.wasm',
  csharp: 'tree-sitter-c_sharp.wasm',
  ruby: 'tree-sitter-ruby.wasm',
});

export function resolveGrammar(rawLang: string): SupportedGrammar | null {
  const normalized = rawLang.trim().toLowerCase();
  return GRAMMAR_ALIASES[normalized] ?? null;
}

export async function loadTreeSitterEngine(): Promise<{
  parser: Parser;
  languages: LanguageGrammarMap;
}> {
  await Parser.init();
  const parser = new Parser();

  const wasmPkg = require.resolve('@repomix/tree-sitter-wasms/package.json');
  const wasmDir = path.join(path.dirname(wasmPkg), 'out');

  const entries = await Promise.all(
    Object.entries(WASM_FILE_BY_GRAMMAR).map(async ([grammar, file]) => {
      const lang = await Language.load(path.join(wasmDir, file));
      return [grammar, lang] as const;
    })
  );

  const languages = Object.fromEntries(entries) as unknown as LanguageGrammarMap;
  return { parser, languages };
}

export async function collectReferenceMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files = files.concat(await collectReferenceMarkdownFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(fullPath);
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
    const fenceMatch = /^```([a-zA-Z0-9#+_-]+)?/.exec(line.trim());

    if (fenceMatch && !inBlock) {
      inBlock = true;
      currentLang = (fenceMatch[1] || '').trim().toLowerCase();
      currentLines = [];
      blockStartLine = i + 1;
    } else if (line.trim().startsWith('```') && inBlock) {
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
    return true; // Skip non-executable/auxiliary blocks (bash, graphql, yaml, etc.)
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

  let allValid = true;

  for (const file of mdFiles) {
    const content = await fs.readFile(file, 'utf8');
    const relPath = path.relative(rootDir, file);
    const snippets = extractSnippetsFromMarkdown(content, relPath, file);

    for (const snippet of snippets) {
      const isValid = validateSingleSnippet(parser, languages, snippet);
      if (!isValid) {
        allValid = false;
      }
    }
  }

  return allValid;
}
