import fs from 'node:fs/promises';
import path from 'node:path';
import { PluginManifestSchema } from '../schemas.js';

export async function validatePluginManifest(rootDir: string): Promise<boolean> {
  const pluginPath = path.join(rootDir, 'plugin.json');
  try {
    const raw = await fs.readFile(pluginPath, 'utf8');
    const pluginJson = JSON.parse(raw);
    const result = await PluginManifestSchema.safeParseAsync(pluginJson);
    if (!result.success) {
      console.error(
        'Error: plugin.json validation failed:',
        result.error.issues.map((i) => `${i.path.join('.') || 'root'}: ${i.message}`).join(', ')
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(
      'Error: plugin.json validation failed:',
      err instanceof Error ? err.message : err
    );
    return false;
  }
}
