import fs from 'node:fs/promises';
import path from 'node:path';
import { McpManifestSchema } from '../schemas.ts';

export async function validateMcpManifest(rootDir: string): Promise<boolean> {
  const mcpPath = path.join(rootDir, 'mcp.json');
  try {
    const mcpJson = JSON.parse(await fs.readFile(mcpPath, 'utf8'));
    await McpManifestSchema.parseAsync(mcpJson);
    return true;
  } catch (err) {
    console.error('Error: mcp.json validation failed:', err instanceof Error ? err.message : err);
    return false;
  }
}
