import fs from 'node:fs/promises';
import path from 'node:path';
import type { z } from 'zod';
import { McpManifestSchema, PluginManifestSchema } from '../schemas.js';

async function validateJsonManifest<T>(
  rootDir: string,
  fileName: string,
  schema: z.ZodType<T>
): Promise<boolean> {
  const filePath = path.join(rootDir, fileName);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    const result = await schema.safeParseAsync(parsed);
    if (!result.success) {
      console.error(
        `Error: ${fileName} validation failed:`,
        result.error.issues.map((i) => `${i.path.join('.') || 'root'}: ${i.message}`).join(', ')
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      `Error: ${fileName} validation failed:`,
      err instanceof Error ? err.message : err
    );
    return false;
  }
}

export async function validatePluginManifest(rootDir: string): Promise<boolean> {
  return validateJsonManifest(rootDir, 'plugin.json', PluginManifestSchema);
}

export async function validateMcpManifest(rootDir: string): Promise<boolean> {
  return validateJsonManifest(rootDir, 'mcp.json', McpManifestSchema);
}
