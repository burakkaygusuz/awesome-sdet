import YAML from 'yaml';
import type { z } from 'zod';

export function parseMarkdownFrontmatter<T>(
  content: string,
  relPath: string,
  schema: z.ZodType<T>,
  entityLabel: string
): { frontmatter: T | null; hasError: boolean } {
  if (!content.startsWith('---')) {
    console.error(`Error: ${relPath}: Missing frontmatter start delimiter '---'`);
    return { frontmatter: null, hasError: true };
  }

  const frontmatterEnd = content.indexOf('---', 3);
  if (frontmatterEnd === -1) {
    console.error(`Error: ${relPath}: Missing frontmatter end delimiter '---'`);
    return { frontmatter: null, hasError: true };
  }

  const frontmatterString = content.substring(3, frontmatterEnd);
  let parsedYaml: unknown;
  try {
    parsedYaml = YAML.parse(frontmatterString);
  } catch (err) {
    console.error(`Error: ${relPath}: Failed to parse YAML frontmatter: ${String(err)}`);
    return { frontmatter: null, hasError: true };
  }

  if (typeof parsedYaml !== 'object' || parsedYaml === null) {
    console.error(`Error: ${relPath}: Frontmatter must be a valid YAML dictionary`);
    return { frontmatter: null, hasError: true };
  }

  const schemaParsed = schema.safeParse(parsedYaml);
  if (!schemaParsed.success) {
    console.error(
      `Error: ${relPath}: ${entityLabel} frontmatter validation failed:`,
      schemaParsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join(', ')
    );
    return { frontmatter: null, hasError: true };
  }

  return { frontmatter: schemaParsed.data, hasError: false };
}
