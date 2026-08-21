import { createRequire } from 'node:module';
import path from 'node:path';
import { Language, type Node, Parser, type Tree } from 'web-tree-sitter';

const require = createRequire(import.meta.url);

export type SupportedGrammar =
  'tsx' | 'typescript' | 'javascript' | 'python' | 'java' | 'csharp' | 'ruby';

const WASM_FILE_BY_GRAMMAR: Record<SupportedGrammar, string> = {
  tsx: 'tree-sitter-tsx.wasm',
  typescript: 'tree-sitter-typescript.wasm',
  javascript: 'tree-sitter-javascript.wasm',
  python: 'tree-sitter-python.wasm',
  java: 'tree-sitter-java.wasm',
  csharp: 'tree-sitter-c_sharp.wasm',
  ruby: 'tree-sitter-ruby.wasm',
};

const GRAMMAR_BY_LANG: Record<string, SupportedGrammar> = {
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
};

const LITERAL_NODE_TYPES = new Set([
  'true',
  'false',
  'number',
  'number_literal',
  'integer',
  'float',
  'string',
  'string_literal',
  'null',
  'nil',
  'undefined',
  'none',
  'boolean',
]);

const CALL_NODE_TYPES = new Set([
  'call_expression',
  'call',
  'invocation_expression',
  'method_invocation',
]);

let initPromise: Promise<void> | null = null;
const loadedLanguages = new Map<SupportedGrammar, Language>();
const inFlightGrammarLoads = new Map<SupportedGrammar, Promise<Language>>();

async function ensureParserInitialized(): Promise<void> {
  if (!initPromise) {
    initPromise = Parser.init();
  }
  return initPromise;
}

async function loadGrammarLanguage(grammarKey: SupportedGrammar): Promise<Language> {
  const cached = loadedLanguages.get(grammarKey);
  if (cached) return cached;

  let inFlight = inFlightGrammarLoads.get(grammarKey);
  if (!inFlight) {
    const wasmPkg = require.resolve('@repomix/tree-sitter-wasms/package.json');
    const wasmPath = path.join(path.dirname(wasmPkg), 'out', WASM_FILE_BY_GRAMMAR[grammarKey]);
    inFlight = Language.load(wasmPath).then((lang) => {
      loadedLanguages.set(grammarKey, lang);
      inFlightGrammarLoads.delete(grammarKey);
      return lang;
    });
    inFlightGrammarLoads.set(grammarKey, inFlight);
  }
  return inFlight;
}

export async function getTreeSitterParser(languageName?: string): Promise<{
  parser: Parser;
  language: Language | null;
}> {
  await ensureParserInitialized();
  const grammarKey = languageName ? (GRAMMAR_BY_LANG[languageName.toLowerCase()] ?? 'tsx') : 'tsx';
  const lang = await loadGrammarLanguage(grammarKey);

  const parser = new Parser();
  if (lang) {
    parser.setLanguage(lang);
  }
  return { parser, language: lang };
}

export function parseAst(parser: Parser, code: string): Tree | null {
  return parser.parse(code);
}

export function isLiteralNode(node: Node): boolean {
  if (LITERAL_NODE_TYPES.has(node.type)) return true;
  if (node.type === 'binary_expression' || node.type === 'comparison_operator') {
    const left = node.childForFieldName('left') ?? node.namedChildren[0];
    const right = node.childForFieldName('right') ?? node.namedChildren[1];
    return Boolean(left && right && isLiteralNode(left) && isLiteralNode(right));
  }
  return false;
}

function extractArgsNode(node: Node): Node | null {
  return (
    node.childForFieldName('arguments') ??
    node.childForFieldName('argument_list') ??
    node.namedChildren.find((c: Node) => c.type.includes('argument')) ??
    null
  );
}

function extractCalleeInfo(fnNode: Node | null): {
  methodName: string;
  objectName: string;
} {
  if (!fnNode) {
    return { methodName: '', objectName: '' };
  }
  if (fnNode.type === 'identifier') {
    return { methodName: fnNode.text, objectName: '' };
  }

  const prop =
    fnNode.childForFieldName('property') ??
    fnNode.childForFieldName('name') ??
    fnNode.childForFieldName('attribute') ??
    fnNode.namedChildren.at(-1);

  const obj =
    fnNode.childForFieldName('object') ??
    fnNode.childForFieldName('expression') ??
    fnNode.namedChildren[0];

  return {
    methodName: prop?.text ?? fnNode.text,
    objectName: obj && obj !== prop ? obj.text : '',
  };
}

export function extractCallInfo(node: Node): {
  methodName: string;
  objectName: string;
  argsNode: Node | null;
} {
  if (!CALL_NODE_TYPES.has(node.type)) {
    return { methodName: '', objectName: '', argsNode: null };
  }

  const argsNode = extractArgsNode(node);

  if (node.type === 'method_invocation') {
    const methodName = node.childForFieldName('name')?.text ?? '';
    const objectName = node.childForFieldName('object')?.text ?? '';
    return { methodName, objectName, argsNode };
  }

  const fnNode = node.childForFieldName('function') ?? node.namedChildren[0] ?? null;
  const { methodName, objectName } = extractCalleeInfo(fnNode);
  return { methodName, objectName, argsNode };
}

export function walkAst(rootNode: Node, visitor: (node: Node) => boolean | void): void {
  function traverse(node: Node): boolean {
    if (node.type === 'comment' || node.type === 'comment_statement') {
      return true;
    }
    const result = visitor(node);
    if (result === false) {
      return false;
    }
    for (const child of node.namedChildren) {
      if (!traverse(child)) {
        return false;
      }
    }
    return true;
  }
  traverse(rootNode);
}

export type SyntaxNode = Node;
export type { Tree };
