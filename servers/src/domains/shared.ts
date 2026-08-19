import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';

export const CodeSnippetSchema = z.strictObject({
  language: z.string().describe('Programming language of the code block'),
  code: z.string().describe('Extracted code snippet'),
});

export const DocsOutputSchema = z.strictObject({
  framework: z.string().describe('Target test automation framework'),
  domain: z.string().describe('Capability domain'),
  language: z.string().describe('Target programming language'),
  title: z.string().describe('Document title'),
  codeSnippets: z.array(CodeSnippetSchema).describe('Extracted code snippets'),
  rawMarkdown: z.string().describe('Complete markdown reference content'),
});

export type DocsOutput = z.infer<typeof DocsOutputSchema>;

/**
 * Extracts structured document metadata, title, and code snippets from raw reference markdown.
 */
export function extractStructuredDocs(
  framework: string,
  domain: string,
  language: string,
  markdown: string
): DocsOutput {
  const lines = markdown.split('\n');
  const titleLine = lines.find((line) => line.startsWith('# ')) ?? '';
  const title = titleLine.replace(/^#\s+/, '').trim() || `${framework} ${domain} (${language})`;

  const codeSnippets: Array<{ language: string; code: string }> = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const snippetLang = (match[1] || language).trim().toLowerCase();
    const code = (match[2] || '').trim();
    if (code.length > 0) {
      codeSnippets.push({ language: snippetLang, code });
    }
  }

  return {
    framework,
    domain,
    language,
    title,
    codeSnippets,
    rawMarkdown: markdown,
  };
}

export const SAFE_READONLY_ANNOTATIONS: ToolAnnotations = Object.freeze({
  readOnlyHint: true,
  destructiveHint: false,
  idempotentHint: true,
  openWorldHint: false,
});

export const LANGUAGE_ALIASES: Readonly<Record<string, string>> = Object.freeze({
  javascript: 'javascript',
  js: 'javascript',
  node: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  python: 'python',
  py: 'python',
  java: 'java',
  csharp: 'csharp',
  cs: 'csharp',
  'c#': 'csharp',
  ruby: 'ruby',
  rb: 'ruby',
});

/**
 * Safely resolves a relative target path against a base directory,
 * preventing directory traversal attacks outside the base.
 */
export function resolveSafePath(baseDir: string, relativeTarget: string): string {
  if (baseDir.includes('\0') || relativeTarget.includes('\0')) {
    throw new Error('Invalid path: null byte detected');
  }

  const normalizedBase = baseDir.startsWith('file://') ? fileURLToPath(baseDir) : baseDir;
  const absBase = path.resolve(normalizedBase);
  const absTarget = path.resolve(absBase, relativeTarget);

  const relative = path.relative(absBase, absTarget);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(
      `Path traversal detected: target '${relativeTarget}' resolves outside base '${baseDir}'`
    );
  }

  return absTarget;
}

/**
 * Validates and normalizes target programming language,
 * rejecting path traversal sequences and unsupported values.
 */
export function sanitizeLanguage<const T extends readonly string[]>(
  rawLanguage: string | undefined | null,
  allowed: T,
  defaultLanguage?: T[number],
  frameworkName?: string
): T[number] {
  if (rawLanguage !== undefined && rawLanguage !== null) {
    if (typeof rawLanguage !== 'string') {
      throw new TypeError(`Invalid language: expected string, received ${typeof rawLanguage}`);
    }
    if (
      rawLanguage.includes('\0') ||
      rawLanguage.includes('..') ||
      rawLanguage.includes('/') ||
      rawLanguage.includes('\\')
    ) {
      throw new Error(
        `Invalid language: path traversal or illegal characters detected in '${rawLanguage}'`
      );
    }
  }

  const normalized = (rawLanguage || '').toLowerCase().trim();
  if (!normalized) {
    if (defaultLanguage !== undefined) {
      return defaultLanguage;
    }
    throw new Error(`Language is required. Allowed languages: ${allowed.join(', ')}.`);
  }

  const canonical = (LANGUAGE_ALIASES[normalized] ?? normalized) as T[number];
  if ((allowed as readonly string[]).includes(canonical)) {
    return canonical;
  }

  const prefix = frameworkName ? `Unsupported ${frameworkName} language:` : 'Unsupported language:';
  const listLabel = frameworkName ? 'Supported languages:' : 'Allowed languages:';
  throw new Error(`${prefix} '${rawLanguage}'. ${listLabel} ${allowed.join(', ')}.`);
}

/**
 * Validates and normalizes target documentation domain,
 * rejecting path traversal sequences and unsupported values.
 */
export function sanitizeDomain<const T extends readonly string[]>(
  rawDomain: string | undefined | null,
  allowed: T,
  defaultDomain?: T[number],
  frameworkName?: string
): T[number] {
  if (rawDomain !== undefined && rawDomain !== null) {
    if (typeof rawDomain !== 'string') {
      throw new TypeError(`Invalid domain: expected string, received ${typeof rawDomain}`);
    }
    if (
      rawDomain.includes('\0') ||
      rawDomain.includes('..') ||
      rawDomain.includes('/') ||
      rawDomain.includes('\\')
    ) {
      throw new Error(
        `Invalid domain: path traversal or illegal characters detected in '${rawDomain}'`
      );
    }
  }

  const normalized = (rawDomain || '').toLowerCase().trim();
  if (!normalized) {
    if (defaultDomain !== undefined) {
      return defaultDomain;
    }
    throw new Error(`Domain is required. Allowed domains: ${allowed.join(', ')}.`);
  }

  if ((allowed as readonly string[]).includes(normalized)) {
    return normalized;
  }

  const prefix = frameworkName ? `Unsupported ${frameworkName} domain:` : 'Unsupported domain:';
  const listLabel = frameworkName ? 'Supported domains:' : 'Allowed domains:';
  throw new Error(`${prefix} '${rawDomain}'. ${listLabel} ${allowed.join(', ')}.`);
}

const referenceCache = new Map<string, string>();

/**
 * Loads the requested language-specific reference markdown file for an MCP module
 * and caches the result in memory.
 */
export async function loadCachedReferenceMarkdown(
  baseUrlOrMetaUrl: string,
  language: string
): Promise<string> {
  const cacheKey = `${baseUrlOrMetaUrl}:${language}`;
  const cached = referenceCache.get(cacheKey);
  if (cached) return cached;

  const baseReferencesDir = baseUrlOrMetaUrl.startsWith('file://')
    ? fileURLToPath(new URL('./references/', baseUrlOrMetaUrl))
    : path.resolve(baseUrlOrMetaUrl, 'references');

  const filePath = resolveSafePath(baseReferencesDir, `${language}.md`);
  const content = await fs.readFile(filePath, 'utf8');
  referenceCache.set(cacheKey, content);
  return content;
}
