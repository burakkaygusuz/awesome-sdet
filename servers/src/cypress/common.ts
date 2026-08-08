import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cypressReferenceCache = new Map<string, string>();

export function readCypressReferenceDoc(domain: string, language: string): string {
  const normalizedLang = language.toLowerCase().trim();
  if (
    normalizedLang !== 'javascript' &&
    normalizedLang !== 'typescript' &&
    normalizedLang !== 'js' &&
    normalizedLang !== 'ts'
  ) {
    throw new Error(
      `Unsupported language: '${language}'. Supported languages: javascript, typescript.`
    );
  }

  const langFile =
    normalizedLang === 'ts'
      ? 'typescript'
      : normalizedLang === 'js'
        ? 'javascript'
        : normalizedLang;
  const cacheKey = `${domain}:${langFile}`;

  const cached = cypressReferenceCache.get(cacheKey);
  if (cached) return cached;

  const filePath = path.join(__dirname, domain, 'references', `${langFile}.md`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Reference doc not found at ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  cypressReferenceCache.set(cacheKey, content);
  return content;
}
