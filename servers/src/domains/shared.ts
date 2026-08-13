import fs from 'node:fs/promises';

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

export function resolveLanguage<const T extends readonly string[]>(
  rawLanguage: string | undefined | null,
  supported: T,
  defaultLanguage: T[number],
  frameworkName: string
): T[number] {
  const normalized = (rawLanguage || '').toLowerCase().trim();
  if (!normalized) {
    return defaultLanguage;
  }

  const canonical = LANGUAGE_ALIASES[normalized] ?? normalized;
  if ((supported as readonly string[]).includes(canonical)) {
    return canonical;
  }

  throw new Error(
    `Unsupported ${frameworkName} language: '${rawLanguage}'. Supported languages: ${supported.join(', ')}.`
  );
}

const referenceCache = new Map<string, string>();

/**
 * Loads a language-specific reference markdown file for an MCP module,
 * caching results in memory and falling back to defaultLanguage if the target language file is unavailable.
 */
export async function loadCachedReferenceMarkdown(
  baseUrlOrMetaUrl: string,
  language: string,
  defaultLanguage: string
): Promise<string> {
  const cacheKey = `${baseUrlOrMetaUrl}:${language}`;
  const cached = referenceCache.get(cacheKey);
  if (cached) return cached;

  const filePath = new URL(`./references/${language}.md`, baseUrlOrMetaUrl);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    referenceCache.set(cacheKey, content);
    return content;
  } catch {
    const defaultPath = new URL(`./references/${defaultLanguage}.md`, baseUrlOrMetaUrl);
    const content = await fs.readFile(defaultPath, 'utf8');
    referenceCache.set(cacheKey, content);
    return content;
  }
}
