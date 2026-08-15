import fs from 'node:fs/promises';
import path from 'node:path';
import { McpManifestSchema } from '../schemas.js';

export async function validateMcpManifest(rootDir: string): Promise<boolean> {
  const mcpPath = path.join(rootDir, 'mcp.json');
  try {
    const raw = await fs.readFile(mcpPath, 'utf8');
    const mcpJson = JSON.parse(raw);
    const result = await McpManifestSchema.safeParseAsync(mcpJson);
    if (!result.success) {
      console.error(
        'Error: mcp.json validation failed:',
        result.error.issues.map((i) => `${i.path.join('.') || 'root'}: ${i.message}`).join(', ')
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error('Error: mcp.json validation failed:', err instanceof Error ? err.message : err);
    return false;
  }
}
