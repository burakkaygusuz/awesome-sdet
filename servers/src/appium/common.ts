import fs from 'node:fs/promises';
import { z } from 'zod';

export const SupportedLanguageSchema = z
  .enum(['typescript', 'javascript', 'python', 'java', 'csharp'] as const)
  .default('typescript')
  .describe(
    'Target programming language: "typescript", "javascript", "python", "java", or "csharp". Defaults to "typescript".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

const referenceCache = new Map<string, string>();

/**
 * Loads a language-specific reference markdown file for an Appium MCP module,
 * caching results in memory and falling back to 'typescript' if the target language file is unavailable.
 */
export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: SupportedLanguage = 'typescript'
): Promise<string> {
  const cacheKey = `${importMetaUrl}:${language}`;
  const cached = referenceCache.get(cacheKey);
  if (cached) return cached;

  const filePath = new URL(`./references/${language}.md`, importMetaUrl);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    referenceCache.set(cacheKey, content);
    return content;
  } catch {
    const defaultPath = new URL(`./references/typescript.md`, importMetaUrl);
    const content = await fs.readFile(defaultPath, 'utf8');
    referenceCache.set(cacheKey, content);
    return content;
  }
}

export async function readAppiumReferenceDoc(
  domain: string,
  language: string = 'typescript'
): Promise<string> {
  const raw = (language || '').toLowerCase().trim();
  let normLang: SupportedLanguage;
  if (raw === 'javascript' || raw === 'js') {
    normLang = 'javascript';
  } else if (raw === 'python' || raw === 'py') {
    normLang = 'python';
  } else if (raw === 'java') {
    normLang = 'java';
  } else if (raw === 'csharp' || raw === 'c#' || raw === 'cs') {
    normLang = 'csharp';
  } else {
    normLang = 'typescript';
  }

  const baseUrl = new URL(`./${domain}/index.js`, import.meta.url).href;
  return loadReferenceMarkdown(baseUrl, normLang);
}
