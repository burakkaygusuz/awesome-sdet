import fs from 'node:fs/promises';
import { z } from 'zod';

export const SupportedLanguageSchema = z
  .enum(['java', 'python', 'typescript', 'javascript', 'csharp', 'ruby'] as const)
  .describe(
    'Target programming language: "java", "python", "typescript", "javascript", "csharp", or "ruby". Defaults to "java".'
  );

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

const referenceCache = new Map<string, string>();

/**
 * Loads a language-specific reference markdown file for an MCP module,
 * caching results in memory and falling back to 'java' if the target language file is unavailable.
 */
export async function loadReferenceMarkdown(
  importMetaUrl: string,
  language: SupportedLanguage = 'java'
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
    const defaultPath = new URL(`./references/java.md`, importMetaUrl);
    const content = await fs.readFile(defaultPath, 'utf8');
    referenceCache.set(cacheKey, content);
    return content;
  }
}
