import fs from 'node:fs/promises';
import { z } from 'zod';

export const SupportedLanguageSchema = z
  .enum(['java', 'python', 'typescript', 'javascript', 'csharp', 'ruby'])
  .describe('Target programming language for Page Object Model / PageFactory patterns.');

export type SupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const PageFactoryClassSchema = z
  .enum([
    'PageFactory',
    'FindBy',
    'FindBys',
    'FindAll',
    'CacheLookup',
    'How',
    'ByIdOrName',
    'ElementLocator',
    'ElementLocatorFactory',
    'DefaultElementLocator',
    'DefaultElementLocatorFactory',
    'AjaxElementLocator',
    'AjaxElementLocatorFactory',
    'FieldDecorator',
    'DefaultFieldDecorator',
    'ByAll',
    'ByChained',
    'Annotations',
    'AbstractAnnotations',
  ])
  .describe('Selenium PageFactory class or annotation name.');

export const PageFactoryDocsSchema = z.object({
  className: PageFactoryClassSchema.optional().describe(
    'Optional Selenium PageFactory class or annotation to look up (e.g. "PageFactory", "AjaxElementLocator", "FindBy"). Omit to receive the full reference.'
  ),
  language: SupportedLanguageSchema.optional().describe(
    'Target programming language for Page Object Model patterns: "java", "python", "typescript", "javascript", "csharp", or "ruby". Defaults to "java".'
  ),
});

export type PageFactoryDocsArgs = z.infer<typeof PageFactoryDocsSchema>;
export type PageFactoryClass = z.infer<typeof PageFactoryClassSchema>;

const languageCache: Map<SupportedLanguage, string> = new Map();
const entryCache: Map<string, string> = new Map();

export function parseMarkdownSections(raw: string): Record<string, string> {
  const sections = raw.split(/\n(?=### )/);
  const map: Record<string, string> = {};

  for (const section of sections) {
    const match = new RegExp(/^### (@?\w+)/).exec(section);
    if (match?.[1]) {
      const key = match[1].startsWith('@') ? match[1].slice(1) : match[1];
      map[key.toLowerCase()] = section.trim();
    }
  }

  return map;
}

export async function loadLanguageMarkdown(language: SupportedLanguage): Promise<string> {
  if (!languageCache.has(language)) {
    const filePath = new URL(`./references/${language}.md`, import.meta.url);
    const content = await fs.readFile(filePath, 'utf8');
    languageCache.set(language, content);
  }
  return languageCache.get(language)!;
}

export async function loadPageFactoryEntries(): Promise<Record<string, string>> {
  if (entryCache.size === 0) {
    const rawJava = await loadLanguageMarkdown('java');
    const parsed = parseMarkdownSections(rawJava);
    for (const [k, v] of Object.entries(parsed)) {
      entryCache.set(k, v);
    }
  }
  return Object.fromEntries(entryCache.entries());
}

export async function handlePageFactoryDocs(args?: PageFactoryDocsArgs) {
  const targetLanguage: SupportedLanguage = args?.language ?? 'java';
  let text: string;

  if (args?.className) {
    const entries = await loadPageFactoryEntries();
    const entry = entries[args.className.toLowerCase()];
    text = entry
      ? `# API Reference — Selenium PageFactory (${args.className})\n\n${entry}`
      : `No entry found for "${args.className}". Available classes: ${PageFactoryClassSchema.options.join(', ')}.`;
  } else {
    text = await loadLanguageMarkdown(targetLanguage);
  }

  return {
    content: [
      {
        type: 'text' as const,
        text,
      },
    ],
  };
}
