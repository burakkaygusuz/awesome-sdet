import fs from 'node:fs/promises';
import path from 'node:path';
import { PluginManifestSchema } from '../schemas.ts';

export async function validatePluginManifest(rootDir: string): Promise<boolean> {
  const pluginPath = path.join(rootDir, 'plugin.json');
  try {
    const pluginJson = JSON.parse(await fs.readFile(pluginPath, 'utf8'));
    await PluginManifestSchema.parseAsync(pluginJson);
    return true;
  } catch (err) {
    console.error(
      'Error: plugin.json validation failed:',
      err instanceof Error ? err.message : err
    );
    return false;
  }
}
