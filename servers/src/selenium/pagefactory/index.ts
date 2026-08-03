import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage, loadReferenceMarkdown } from '../common.js';

export { SupportedLanguageSchema, SupportedLanguage };

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
  ] as const)
  .describe('Selenium PageFactory class or annotation name.');

export const PageFactoryDocsSchema = z.object({
  className: PageFactoryClassSchema.optional().describe(
    'Optional Selenium PageFactory class or annotation to look up (e.g. "PageFactory", "AjaxElementLocator", "FindBy"). Omit to receive the full reference.'
  ),
  language: SupportedLanguageSchema.optional(),
});

export type PageFactoryDocsArgs = z.infer<typeof PageFactoryDocsSchema>;
export type PageFactoryClass = z.infer<typeof PageFactoryClassSchema>;

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

export async function loadPageFactoryEntries(): Promise<Record<string, string>> {
  if (entryCache.size === 0) {
    const rawJava = await loadReferenceMarkdown(import.meta.url, 'java');
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
    text = await loadReferenceMarkdown(import.meta.url, targetLanguage);
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
