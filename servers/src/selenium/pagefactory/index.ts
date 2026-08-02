import fs from 'node:fs/promises';
import { z } from 'zod';

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
});

export type PageFactoryDocsArgs = z.infer<typeof PageFactoryDocsSchema>;

export type PageFactoryClass = z.infer<typeof PageFactoryClassSchema>;

const REFERENCE_MARKDOWN_PATH = new URL('./reference.md', import.meta.url);

let cachedMarkdown: string | null = null;
let cachedEntries: Record<PageFactoryClass, string> | null = null;

export function parseMarkdownSections(raw: string): Record<string, string> {
  const sections = raw.split(/\n(?=### )/);
  const map: Record<string, string> = {};

  for (const section of sections) {
    const match = new RegExp(/^### (@?\w+)/).exec(section);
    if (match?.[1]) {
      const key = match[1].startsWith('@') ? match[1].slice(1) : match[1];
      map[key] = section.trim();
    }
  }

  return map;
}

export async function loadPageFactoryMarkdown(): Promise<string> {
  if (!cachedMarkdown) {
    cachedMarkdown = await fs.readFile(REFERENCE_MARKDOWN_PATH, 'utf8');
  }
  return cachedMarkdown;
}

export async function loadPageFactoryEntries(): Promise<Record<PageFactoryClass, string>> {
  if (!cachedEntries) {
    const raw = await loadPageFactoryMarkdown();
    cachedEntries = parseMarkdownSections(raw) as Record<PageFactoryClass, string>;
  }
  return cachedEntries;
}

const FULL_HEADER = `# API Reference — org.openqa.selenium.support & org.openqa.selenium.support.pagefactory`;

export async function handlePageFactoryDocs(args?: PageFactoryDocsArgs) {
  let text: string;
  if (args?.className) {
    const entries = await loadPageFactoryEntries();
    const entry = entries[args.className];
    text = entry
      ? `${FULL_HEADER}\n\n${entry}`
      : `No entry found for "${args.className}". Available classes: ${PageFactoryClassSchema.options.join(', ')}.`;
  } else {
    text = await loadPageFactoryMarkdown();
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
