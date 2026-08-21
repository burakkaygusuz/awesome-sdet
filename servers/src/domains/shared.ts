import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ToolAnnotations } from '@modelcontextprotocol/server';
import { z } from 'zod';

export interface MarkdownSection {
  heading: string;
  level: number;
  content: string;
  codeSnippets: Array<{ language: string; code: string }>;
}

export const CodeSnippetSchema = z.strictObject({
  language: z.string().describe('Programming language of the code block'),
  code: z.string().describe('Extracted code snippet'),
});

export const DocsOutputSchema = z.strictObject({
  framework: z.string().describe('Target test automation framework'),
  domain: z.string().describe('Capability domain'),
  language: z.string().describe('Target programming language'),
  title: z.string().describe('Document title'),
  query: z.string().optional().describe('Applied search query or filter topic, if any'),
  matchedSections: z.array(z.string()).describe('Headings of matched document sections'),
  codeSnippets: z.array(CodeSnippetSchema).describe('Extracted code snippets'),
});

export type DocsOutput = z.infer<typeof DocsOutputSchema>;

export interface ExtractedDocsResult {
  readonly structuredContent: DocsOutput;
  readonly renderedMarkdown: string;
}

/**
 * Extracts code blocks from a markdown text chunk.
 */
export function extractCodeBlocksFromChunk(
  text: string,
  fallbackLanguage: string
): Array<{ language: string; code: string }> {
  const codeSnippets: Array<{ language: string; code: string }> = [];
  const codeBlockRegex = /```([a-zA-Z0-9_-]+)?\r?\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    const snippetLang = (match[1] || fallbackLanguage).trim().toLowerCase();
    const code = (match[2] || '').trim();
    if (code.length > 0) {
      codeSnippets.push({ language: snippetLang, code });
    }
  }

  return codeSnippets;
}

/**
 * Parses markdown into hierarchical sections based on headings (#, ##, ###).
 */
export function parseMarkdownSections(
  markdown: string,
  defaultLanguage: string
): MarkdownSection[] {
  const sections: MarkdownSection[] = [];
  const lines = markdown.split('\n');
  let currentHeading = 'Overview';
  let currentLevel = 1;
  let currentLines: string[] = [];
  let inCodeBlock = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
    }

    const headingMatch = inCodeBlock ? null : /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (headingMatch) {
      if (currentLines.length > 0) {
        const content = currentLines.join('\n').trim();
        sections.push({
          heading: currentHeading,
          level: currentLevel,
          content,
          codeSnippets: extractCodeBlocksFromChunk(content, defaultLanguage),
        });
        currentLines = [];
      }
      currentLevel = headingMatch[1].length;
      currentHeading = headingMatch[2].trim();
    } else {
      currentLines.push(line);
    }
  }

  if (currentLines.length > 0) {
    const content = currentLines.join('\n').trim();
    sections.push({
      heading: currentHeading,
      level: currentLevel,
      content,
      codeSnippets: extractCodeBlocksFromChunk(content, defaultLanguage),
    });
  }

  return sections;
}

/**
 * Filters sections by a keyword or symbol query.
 * Matches against section heading, content, and code snippet text.
 */
export function filterMarkdownSections(
  sections: readonly MarkdownSection[],
  query?: string
): MarkdownSection[] {
  if (!query || query.trim().length === 0) {
    return [...sections];
  }

  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter((t) => t.length > 0);

  return sections.filter((section) => {
    const headingLower = section.heading.toLowerCase();
    const contentLower = section.content.toLowerCase();
    const codeTextLower = section.codeSnippets.map((c) => c.code.toLowerCase()).join(' ');

    return terms.some(
      (term) =>
        headingLower.includes(term) || contentLower.includes(term) || codeTextLower.includes(term)
    );
  });
}

/**
 * Extracts structured document metadata, title, and code snippets from raw reference markdown,
 * with AST heading parsing and optional query filtering.
 */
export function extractStructuredDocs(
  framework: string,
  domain: string,
  language: string,
  markdown: string,
  query?: string
): ExtractedDocsResult {
  const sections = parseMarkdownSections(markdown, language);
  const titleSection = sections.find((s) => s.level === 1);
  const title = titleSection?.heading || `${framework} ${domain} (${language})`;

  const filteredSections = filterMarkdownSections(sections, query);
  const matchedHeadings = filteredSections.map((s) => s.heading);

  const codeSnippets: Array<{ language: string; code: string }> = [];
  for (const section of filteredSections) {
    codeSnippets.push(...section.codeSnippets);
  }

  let renderedMarkdown: string;
  if (query) {
    if (filteredSections.length === 0) {
      const availableHeadings = sections
        .map((s) => s.heading)
        .filter((h) => h && h !== title && !h.startsWith('#'));
      const formattedHeadings = availableHeadings.map((h) => '- ' + h).join('\n');
      const headingsList =
        availableHeadings.length > 0
          ? `\n\nAvailable sections in this domain:\n${formattedHeadings}`
          : '';
      renderedMarkdown = `# ${title} [No matches for: "${query}"]\n\nNo sections found matching query "${query}" in ${framework} ${domain} (${language}).${headingsList}`;
    } else {
      const breadcrumb = `# ${title} [Filtered for: "${query}"]\n\n`;
      renderedMarkdown =
        breadcrumb +
        filteredSections
          .map((s) => `${'#'.repeat(Math.max(2, s.level))} ${s.heading}\n\n${s.content}`)
          .join('\n\n---\n\n');
    }
  } else {
    renderedMarkdown = markdown;
  }

  return {
    structuredContent: {
      framework,
      domain,
      language,
      title,
      query: query || undefined,
      matchedSections: matchedHeadings,
      codeSnippets,
    },
    renderedMarkdown,
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

export const MAX_REFERENCE_CACHE_ENTRIES = 256;
const referenceCache = new Map<string, string>();

/**
 * Loads the requested language-specific reference markdown file for an MCP module
 * and caches the result in memory with defensive maximum capacity.
 */
export async function loadCachedReferenceMarkdown(
  referencesDirOrUrl: string,
  language: string
): Promise<string> {
  const cacheKey = `${referencesDirOrUrl}:${language}`;
  const cached = referenceCache.get(cacheKey);
  if (cached) return cached;

  const baseReferencesDir = referencesDirOrUrl.startsWith('file://')
    ? fileURLToPath(referencesDirOrUrl)
    : path.resolve(referencesDirOrUrl);

  const filePath = resolveSafePath(baseReferencesDir, `${language}.md`);
  const content = await fs.readFile(filePath, 'utf8');

  if (referenceCache.size >= MAX_REFERENCE_CACHE_ENTRIES) {
    const oldestKey = referenceCache.keys().next().value;
    if (oldestKey) referenceCache.delete(oldestKey);
  }

  referenceCache.set(cacheKey, content);
  return content;
}

/**
 * Loads and caches reference markdown documentation for any framework and domain.
 */
export async function readFrameworkReferenceDoc(
  framework: string,
  domain: string,
  language: string
): Promise<string> {
  const referencesDirUrl = new URL(`./${framework}/${domain}/references/`, import.meta.url).href;
  return loadCachedReferenceMarkdown(referencesDirUrl, language);
}
