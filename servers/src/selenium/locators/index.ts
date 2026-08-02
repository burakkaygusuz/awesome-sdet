import fs from 'node:fs/promises';
import { z } from 'zod';
import { SupportedLanguageSchema, SupportedLanguage } from '../pagefactory/index.js';

export const LocatorStrategySchema = z
  .enum([
    'id',
    'cssSelector',
    'xpath',
    'name',
    'className',
    'tagName',
    'linkText',
    'partialLinkText',
    'relativeLocators',
  ])
  .describe('Selenium locator strategy to look up.');

export type LocatorStrategy = z.infer<typeof LocatorStrategySchema>;

export const LocatorDocsSchema = z.object({
  strategy: LocatorStrategySchema.optional().describe(
    'Specific locator strategy to query (e.g. "id", "cssSelector", "xpath", "relativeLocators"). Omit for complete guide.'
  ),
  language: SupportedLanguageSchema.optional().describe(
    'Target programming language: "java", "python", "typescript", "javascript", "csharp", or "ruby". Defaults to "java".'
  ),
});

export type LocatorDocsArgs = z.infer<typeof LocatorDocsSchema>;

export const STRATEGY_HIERARCHY_MARKDOWN = `## Strategy Hierarchy & Best Practices

| Strategy | Speed / Priority | Best Used For | Best Practice |
| :--- | :--- | :--- | :--- |
| **\`id\`** | 🥇 #1 (Fastest) | Unique DOM element | Prefer unique static IDs over auto-generated dynamic IDs. |
| **\`cssSelector\`** | 🥈 #2 (High Speed) | Complex styling, classes, attributes | Fast, clean, readable CSS selectors (\`.btn-primary[type='submit']\`). |
| **\`name\`** | 🥉 #3 (Fast) | Form inputs | Ideal for standard form fields (\`<input name="...">\`). |
| **\`className\`** | 🥉 #3 (Fast) | Single CSS class matching | Use when matching a single unique class name. |
| **\`tagName\`** | 🥉 #3 (Fast) | Group operations | Best used with \`findElements\` to collect lists (\`<button>\`, \`<a>\`). |
| **\`linkText\`** | 🥉 #3 (Fast) | Exact anchor text | Best for standard navigation links (\`<a>Home</a>\`). |
| **\`partialLinkText\`** | 🥉 #3 (Fast) | Partial anchor text | Best for dynamic links containing known substrings. |
| **\`xpath\`** | 🏅 #4 (Flexible) | Hierarchy & text lookup | Avoid absolute XPaths (\`/html/body/...\`). Use relative XPaths (\`//button[contains(text(), 'Save')]\`). |
| **\`relativeLocators\`** | 🏅 #4 (Spatial) | Spatial position in Selenium 4 | Use Selenium 4 \`above() / below() / toLeftOf() / toRightOf() / near()\`. |`;

const languageCache: Map<SupportedLanguage, string> = new Map();

export async function loadLocatorMarkdown(language: SupportedLanguage): Promise<string> {
  const cached = languageCache.get(language);
  if (cached) return cached;

  const filePath = new URL(`./references/${language}.md`, import.meta.url);
  const content = await fs.readFile(filePath, 'utf8');
  languageCache.set(language, content);
  return content;
}

const FULL_HEADER = `# API Reference — Selenium Locator Strategies & Best Practices`;

export async function handleLocatorDocs(args?: LocatorDocsArgs) {
  const targetLanguage: SupportedLanguage = args?.language ?? 'java';
  const langCodeExamples = await loadLocatorMarkdown(targetLanguage);
  const combinedMarkdown = `${FULL_HEADER}\n\n${STRATEGY_HIERARCHY_MARKDOWN}\n\n---\n\n${langCodeExamples}`;

  if (args?.strategy) {
    const strategyName = args.strategy;
    const lines = STRATEGY_HIERARCHY_MARKDOWN.split('\n');
    const matchingLines = lines.filter((line) =>
      line.toLowerCase().includes(`**\`${strategyName.toLowerCase()}\`**`)
    );

    const text =
      matchingLines.length > 0
        ? `${FULL_HEADER} (${strategyName})\n\n${matchingLines.join('\n')}\n\n---\n\n${combinedMarkdown}`
        : combinedMarkdown;

    return {
      content: [
        {
          type: 'text' as const,
          text,
        },
      ],
    };
  }

  return {
    content: [
      {
        type: 'text' as const,
        text: combinedMarkdown,
      },
    ],
  };
}
