import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const SupportedLanguageSchema = z
  .enum(['javascript', 'typescript'] as const)
  .default('typescript')
  .describe('Target programming language: "javascript" or "typescript". Defaults to "typescript".');

export type CypressSupportedLanguage = z.infer<typeof SupportedLanguageSchema>;

export const CypressDomainSchema = z
  .enum([
    'commands',
    'component',
    'fixtures',
    'network',
    'session',
    'shadow',
    'stubs',
    'task',
  ] as const)
  .describe('Supported Cypress documentation domain');

export type CypressDomain = z.infer<typeof CypressDomainSchema>;

const cypressReferenceCache = new Map<string, string>();

export async function readCypressReferenceDoc(
  domain: string,
  language: string = 'typescript'
): Promise<string> {
  const normalizedLang = (language || '').toLowerCase().trim();
  let langFile: CypressSupportedLanguage;
  if (normalizedLang === 'javascript' || normalizedLang === 'js') {
    langFile = 'javascript';
  } else if (normalizedLang === 'typescript' || normalizedLang === 'ts' || !normalizedLang) {
    langFile = 'typescript';
  } else {
    throw new Error(
      `Unsupported language: '${language}'. Supported languages: javascript, typescript.`
    );
  }

  const normalizedDomain = (domain || '').toLowerCase().trim();
  const domainParse = CypressDomainSchema.safeParse(normalizedDomain);
  if (!domainParse.success) {
    throw new Error(
      `Unsupported Cypress domain: '${domain}'. Valid domains: ${CypressDomainSchema.options.join(', ')}.`
    );
  }

  const safeDomain = domainParse.data;
  const cacheKey = `${safeDomain}:${langFile}`;
  const cached = cypressReferenceCache.get(cacheKey);
  if (cached) return cached;

  const filePath = path.join(__dirname, safeDomain, 'references', `${langFile}.md`);
  try {
    const content = await fs.readFile(filePath, 'utf8');
    cypressReferenceCache.set(cacheKey, content);
    return content;
  } catch (error) {
    throw new Error(
      `Reference doc not found at ${filePath}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
}
